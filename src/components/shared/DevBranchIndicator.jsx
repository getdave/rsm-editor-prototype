import { useCallback, useState } from 'react'

const branchLabel =
  import.meta.env.VITE_BRANCH_NAME?.trim() || 'dev'

export default function DevBranchIndicator() {
  const [ expanded, setExpanded ] = useState(false)

  const toggle = useCallback(() => {
    setExpanded(( open ) => !open)
  }, [])

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div className="dev-branch-indicator">
      {expanded ? (
        <button
          type="button"
          className="dev-branch-indicator__panel"
          onClick={toggle}
          aria-expanded="true"
        >
          <span className="dev-branch-indicator__branch">
            Branch: {branchLabel}
          </span>
          <span className="dev-branch-indicator__note">
            Development only — not part of the prototype
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="dev-branch-indicator__pill"
          onClick={toggle}
          aria-expanded="false"
          aria-label={`Development branch ${branchLabel}. Click for details.`}
        >
          {branchLabel}
        </button>
      )}
    </div>
  )
}
