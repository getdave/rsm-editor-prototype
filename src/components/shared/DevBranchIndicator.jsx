import { useCallback, useState } from 'react'
import { Tooltip } from '@wordpress/components'
import {
  DEV_BRANCH_LABEL,
  DEV_PREVIEW_URL,
  DEV_SERVER_PORT,
} from '../../utils/devBranchLabel.js'

const branchLabel = DEV_BRANCH_LABEL || 'local'
const portLabel = DEV_SERVER_PORT ? `:${DEV_SERVER_PORT}` : ''

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
          <span className="dev-branch-indicator__row">
            <span>Branch</span>
            <strong>{branchLabel}</strong>
          </span>
          {DEV_SERVER_PORT && (
            <span className="dev-branch-indicator__row">
              <span>Port</span>
              <strong>{portLabel}</strong>
            </span>
          )}
          {DEV_PREVIEW_URL && (
            <span className="dev-branch-indicator__row">
              <span>Preview</span>
              <strong>{DEV_PREVIEW_URL}</strong>
            </span>
          )}
          <span className="dev-branch-indicator__note">
            Development only - not part of the prototype
          </span>
        </button>
      ) : (
        <Tooltip text="Development preview details" placement="top">
          <button
            type="button"
            className="dev-branch-indicator__trigger"
            onClick={toggle}
            aria-expanded="false"
            aria-label={`Development preview ${branchLabel} ${portLabel}. Click for details.`}
          >
            <span className="dev-branch-indicator__code" aria-hidden="true">
              {'</>'}
            </span>
          </button>
        </Tooltip>
      )}
    </div>
  )
}
