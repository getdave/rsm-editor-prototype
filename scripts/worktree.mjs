#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const PORT_START = 5174
const PORT_END = 5973
const REGISTRY_FILE = 'rsm-worktree-ports.json'
const LOCK_DIR = `${REGISTRY_FILE}.lock`
const LOCK_TIMEOUT_MS = 5000
const STALE_LOCK_MS = 30000

function usage() {
  console.error(`Usage:
  node scripts/worktree.mjs create <branch-name> [port]
  node scripts/worktree.mjs cleanup <branch-or-path> [--delete-branch] [--force]
  node scripts/worktree.mjs setup [port]
  node scripts/worktree.mjs teardown

Commands:
  create  Create a sibling git worktree, write .env.local, and run npm ci.
  cleanup Remove a worktree, clear its port assignment, and optionally delete its branch.
  setup   Write .env.local for the current worktree. Used by Cursor setup.
  teardown Remove the current workspace from the main checkout. Used by Conductor.
`)
  process.exit(1)
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio ?? [ 'ignore', 'pipe', 'pipe' ],
  }).trim()
}

function gitSucceeds(args, cwd = process.cwd()) {
  const result = spawnSync('git', args, {
    cwd,
    stdio: 'ignore',
  })
  return result.status === 0
}

function gitOutput(args, cwd = process.cwd()) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: [ 'ignore', 'pipe', 'pipe' ],
  })

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`)
  }

  return result.stdout.trim()
}

function run(command, args, cwd) {
  const executable = process.platform === 'win32' && command === 'npm'
    ? 'npm.cmd'
    : command

  const result = spawnSync(executable, args, {
    cwd,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function getRepoRoot(cwd = process.cwd()) {
  return git([ 'rev-parse', '--show-toplevel' ], { cwd })
}

function getGitCommonDir(cwd = process.cwd()) {
  return git(
    [ 'rev-parse', '--path-format=absolute', '--git-common-dir' ],
    { cwd }
  )
}

function slugify(value) {
  return value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'worktree'
}

function parsePort(value) {
  if (value === undefined || value === '') {
    return null
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid port "${value}". Expected a number from 1 to 65535.`)
  }

  const port = Number.parseInt(value, 10)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port "${value}". Expected a number from 1 to 65535.`)
  }

  return port
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => {
        resolve(true)
      })
    })

    server.listen(port, '127.0.0.1')
  })
}

function readRegistry(registryPath) {
  if (!fs.existsSync(registryPath)) {
    return { version: 1, assignments: {} }
  }

  const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  return {
    version: 1,
    assignments: parsed.assignments ?? {},
  }
}

function writeRegistry(registryPath, registry) {
  fs.writeFileSync(
    registryPath,
    `${JSON.stringify(registry, null, 2)}\n`,
    'utf8'
  )
}

async function withRegistryLock(commonDir, callback) {
  const lockPath = path.join(commonDir, LOCK_DIR)
  const start = Date.now()

  while (true) {
    try {
      fs.mkdirSync(lockPath)
      break
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error
      }

      const stat = fs.statSync(lockPath)
      if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
        fs.rmSync(lockPath, { recursive: true, force: true })
        continue
      }

      if (Date.now() - start > LOCK_TIMEOUT_MS) {
        throw new Error('Timed out waiting for the worktree port registry lock.')
      }

      await sleep(100)
    }
  }

  try {
    return await callback()
  } finally {
    fs.rmSync(lockPath, { recursive: true, force: true })
  }
}

function cleanupRegistry(registry) {
  for (const worktreePath of Object.keys(registry.assignments)) {
    if (!fs.existsSync(worktreePath)) {
      delete registry.assignments[worktreePath]
    }
  }
}

async function removeRegistryAssignment(commonDir, worktreePath) {
  const registryPath = path.join(commonDir, REGISTRY_FILE)

  await withRegistryLock(commonDir, async () => {
    const registry = readRegistry(registryPath)
    cleanupRegistry(registry)

    const candidates = new Set([
      worktreePath,
      fs.existsSync(worktreePath) ? fs.realpathSync(worktreePath) : worktreePath,
    ])

    for (const candidate of candidates) {
      delete registry.assignments[candidate]
    }

    writeRegistry(registryPath, registry)
  })
}

async function allocatePort(worktreePath, label, explicitPort, commonDir = getGitCommonDir(worktreePath)) {
  const registryPath = path.join(commonDir, REGISTRY_FILE)

  return withRegistryLock(commonDir, async () => {
    const registry = readRegistry(registryPath)
    cleanupRegistry(registry)

    const existing = registry.assignments[worktreePath]
    if (existing && explicitPort === null) {
      existing.label = label
      existing.slug = slugify(label)
      existing.updatedAt = new Date().toISOString()
      writeRegistry(registryPath, registry)
      return existing.port
    }

    if (explicitPort !== null) {
      const existingAssignment = Object.entries(registry.assignments)
        .find(([ assignedPath, entry ]) => (
          assignedPath !== worktreePath &&
          entry.port === explicitPort &&
          fs.existsSync(assignedPath)
        ))

      if (existingAssignment) {
        throw new Error(
          `Port ${explicitPort} is already assigned to ${existingAssignment[0]}.`
        )
      }

      const available = await isPortAvailable(explicitPort)
      if (!available) {
        throw new Error(`Port ${explicitPort} is already in use.`)
      }

      registry.assignments[worktreePath] = {
        port: explicitPort,
        label,
        slug: slugify(label),
        updatedAt: new Date().toISOString(),
      }
      writeRegistry(registryPath, registry)
      return explicitPort
    }

    const assignedPorts = new Set(
      Object.values(registry.assignments).map((entry) => entry.port)
    )

    for (let port = PORT_START; port <= PORT_END; port += 1) {
      if (assignedPorts.has(port)) {
        continue
      }

      if (!(await isPortAvailable(port))) {
        continue
      }

      registry.assignments[worktreePath] = {
        port,
        label,
        slug: slugify(label),
        updatedAt: new Date().toISOString(),
      }
      writeRegistry(registryPath, registry)
      return port
    }

    throw new Error(`No available ports in ${PORT_START}-${PORT_END}.`)
  })
}

function formatEnvValue(value) {
  if (/^[A-Za-z0-9_./:@-]+$/.test(value)) {
    return value
  }

  return JSON.stringify(value)
}

function stripManagedEnv(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => !/^\s*VITE_(PORT|WORKTREE_LABEL|WORKTREE_SLUG|BRANCH_NAME)=/.test(line))
    .join(os.EOL)
    .replace(/\s+$/g, '')
}

function readEnvSource(worktreePath, sourceEnvPath) {
  const targetEnvPath = path.join(worktreePath, '.env.local')
  if (fs.existsSync(targetEnvPath)) {
    return fs.readFileSync(targetEnvPath, 'utf8')
  }

  if (sourceEnvPath && fs.existsSync(sourceEnvPath)) {
    return fs.readFileSync(sourceEnvPath, 'utf8')
  }

  return ''
}

function writeEnvLocal(worktreePath, { label, port, sourceEnvPath }) {
  const slug = slugify(label)
  const targetEnvPath = path.join(worktreePath, '.env.local')
  const preserved = stripManagedEnv(readEnvSource(worktreePath, sourceEnvPath))
  const managed = [
    `VITE_PORT=${port}`,
    `VITE_WORKTREE_LABEL=${formatEnvValue(label)}`,
    `VITE_WORKTREE_SLUG=${formatEnvValue(slug)}`,
    `VITE_BRANCH_NAME=${formatEnvValue(label)}`,
  ]

  const managedBlock = managed.join(os.EOL)
  const content = preserved
    ? `${preserved}${os.EOL}${os.EOL}${managedBlock}`
    : managedBlock

  fs.writeFileSync(targetEnvPath, `${content}${os.EOL}`, 'utf8')

  return {
    label,
    slug,
    port,
    previewUrl: `http://localhost:${port}/`,
  }
}

function inferLabel(worktreePath) {
  if (process.env.VITE_WORKTREE_LABEL) {
    return process.env.VITE_WORKTREE_LABEL
  }

  if (process.env.VITE_BRANCH_NAME) {
    return process.env.VITE_BRANCH_NAME
  }

  try {
    const branch = git([ 'rev-parse', '--abbrev-ref', 'HEAD' ], {
      cwd: worktreePath,
    })

    if (branch && branch !== 'HEAD') {
      return branch
    }

    const sha = git([ 'rev-parse', '--short', 'HEAD' ], {
      cwd: worktreePath,
    })
    return sha ? `detached @ ${sha}` : 'detached'
  } catch {
    return path.basename(worktreePath)
  }
}

function listWorktrees(root) {
  const output = gitOutput([ 'worktree', 'list', '--porcelain' ], root)
  const worktrees = []
  let current = null

  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith('worktree ')) {
      if (current) {
        worktrees.push(current)
      }

      current = {
        path: line.slice('worktree '.length),
        branchName: null,
      }
      continue
    }

    if (current && line.startsWith('branch refs/heads/')) {
      current.branchName = line.slice('branch refs/heads/'.length)
    }
  }

  if (current) {
    worktrees.push(current)
  }

  return worktrees
}

function normalizeExistingPath(value) {
  return fs.existsSync(value) ? fs.realpathSync(value) : path.resolve(value)
}

function resolveWorktreeTarget(root, target) {
  const worktrees = listWorktrees(root)
  const pathCandidate = path.isAbsolute(target)
    ? path.resolve(target)
    : path.resolve(root, target)
  const normalizedCandidate = normalizeExistingPath(pathCandidate)
  const matches = worktrees.filter((worktree) => {
    const normalizedWorktreePath = normalizeExistingPath(worktree.path)

    return (
      normalizedWorktreePath === normalizedCandidate ||
      worktree.path === target ||
      worktree.branchName === target ||
      path.basename(worktree.path) === target ||
      path.basename(worktree.path) === `rsm-prototyping-${slugify(target)}`
    )
  })

  if (matches.length === 1) {
    return matches[0]
  }

  if (matches.length > 1) {
    throw new Error(`Multiple worktrees match "${target}". Use an absolute path.`)
  }

  throw new Error(`No worktree found for "${target}". Run npm run worktree:list to see active worktrees.`)
}

function parseCleanupArgs(args) {
  let target = null
  let deleteBranch = false
  let force = false

  for (const arg of args) {
    if (arg === '--delete-branch') {
      deleteBranch = true
      continue
    }

    if (arg === '--force') {
      force = true
      continue
    }

    if (target) {
      throw new Error(`Unexpected argument "${arg}".`)
    }

    target = arg
  }

  if (!target) {
    usage()
  }

  return { target, deleteBranch, force }
}

async function setupCurrentWorktree(portArg) {
  const worktreePath = fs.realpathSync(getRepoRoot())
  const explicitPort = parsePort(portArg)
  const label = inferLabel(worktreePath)
  const port = await allocatePort(worktreePath, label, explicitPort)
  const rootWorktreePath = process.env.ROOT_WORKTREE_PATH
  const sourceEnvPath = rootWorktreePath
    ? path.join(rootWorktreePath, '.env.local')
    : undefined
  const info = writeEnvLocal(worktreePath, {
    label,
    port,
    sourceEnvPath,
  })

  printReady(info, worktreePath)
}

async function createWorktree(branchName, portArg) {
  if (!branchName) {
    usage()
  }

  const root = getRepoRoot()
  const commonDir = getGitCommonDir(root)
  const parent = path.dirname(root)
  const slug = slugify(branchName)
  const worktreePath = path.join(parent, `rsm-prototyping-${slug}`)
  const realWorktreePath = path.join(
    fs.realpathSync(parent),
    `rsm-prototyping-${slug}`
  )

  if (fs.existsSync(worktreePath)) {
    throw new Error(`Refusing to create worktree: path already exists: ${worktreePath}`)
  }

  const explicitPort = parsePort(portArg)
  const port = await allocatePort(
    realWorktreePath,
    branchName,
    explicitPort,
    commonDir
  )

  if (gitSucceeds([ 'show-ref', '--verify', '--quiet', `refs/heads/${branchName}` ], root)) {
    run('git', [ 'worktree', 'add', worktreePath, branchName ], root)
  } else {
    run('git', [ 'worktree', 'add', '-b', branchName, worktreePath ], root)
  }

  const info = writeEnvLocal(realWorktreePath, {
    label: branchName,
    port,
    sourceEnvPath: path.join(root, '.env.local'),
  })

  run('npm', [ 'ci' ], realWorktreePath)

  printReady(info, realWorktreePath)
}

async function cleanupWorktreeFromRoot(root, args) {
  const { target, deleteBranch, force } = parseCleanupArgs(args)
  root = fs.realpathSync(root)
  const commonDir = getGitCommonDir(root)
  const worktree = resolveWorktreeTarget(root, target)
  const worktreePath = normalizeExistingPath(worktree.path)

  if (worktreePath === root) {
    throw new Error('Refusing to remove the current worktree.')
  }

  const removeArgs = [ 'worktree', 'remove' ]
  if (force) {
    removeArgs.push('--force')
  }
  removeArgs.push(worktree.path)

  run('git', removeArgs, root)
  await removeRegistryAssignment(commonDir, worktreePath)

  if (deleteBranch) {
    if (!worktree.branchName) {
      console.warn('No local branch was associated with this worktree.')
    } else {
      run('git', [ 'branch', force ? '-D' : '-d', worktree.branchName ], root)
    }
  }

  console.log('')
  console.log('Worktree removed')
  console.log(`  Path: ${worktree.path}`)
  if (worktree.branchName) {
    console.log(`  Branch: ${deleteBranch ? 'deleted ' : ''}${worktree.branchName}`)
  }
}

async function cleanupWorktree(args) {
  await cleanupWorktreeFromRoot(getRepoRoot(), args)
}

async function teardownCurrentWorkspace() {
  const worktreePath = fs.realpathSync(getRepoRoot())
  const mainRoot = path.dirname(getGitCommonDir(worktreePath))

  await cleanupWorktreeFromRoot(mainRoot, [ worktreePath ])
}

function printReady(info, worktreePath) {
  console.log('')
  console.log('Worktree ready')
  console.log(`  Branch: ${info.label}`)
  console.log(`  Path: ${worktreePath}`)
  console.log(`  Port: ${info.port}`)
  console.log(`  Preview: ${info.previewUrl}`)
  console.log('')
  console.log(`Run: cd "${worktreePath}" && npm run dev`)
}

async function main() {
  const [ command, firstArg, secondArg, ...remainingArgs ] = process.argv.slice(2)

  if (command === 'create') {
    await createWorktree(firstArg, secondArg)
    return
  }

  if (command === 'cleanup') {
    await cleanupWorktree([ firstArg, secondArg, ...remainingArgs ].filter(Boolean))
    return
  }

  if (command === 'setup') {
    await setupCurrentWorktree(firstArg)
    return
  }

  if (command === 'teardown') {
    await teardownCurrentWorkspace()
    return
  }

  usage()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
