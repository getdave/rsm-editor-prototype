import { Tooltip } from '@wordpress/components';
import { search, pencil } from '@wordpress/icons';
import { useAppState } from '../hooks/useAppState';

function SiteEditorHeader() {
  const {
    siteTitle,
    openSiteIdentityModal,
    openCommandPalette,
    hasUnsavedChanges,
    save,
    siteStatus,
  } = useAppState();

  const isLive = siteStatus === 'live';
  const statusLabel = isLive ? 'Site is live' : 'Site is private';

  return (
    <header className="site-editor-header">
      {/* Site identity — single edit affordance matching trunk's
          sidebar site-anchor: logo + title + pencil-on-hover. */}
      <div className="seh-anchor">
        <Tooltip text="Edit site identity" placement="bottom">
          <button
            type="button"
            className="seh-identity"
            onClick={openSiteIdentityModal}
            aria-label="Edit site identity"
          >
            <span className="seh-logo" aria-hidden="true" />
            <span className="seh-title">{siteTitle}</span>
            <span className="seh-pencil" aria-hidden="true">{pencil}</span>
          </button>
        </Tooltip>
      </div>

      <Tooltip text="Search (⌘K)" placement="bottom">
        <button
          type="button"
          className="seh-search"
          onClick={openCommandPalette}
          aria-label="Open command palette"
        >
          <span className="seh-search-icon" aria-hidden="true">{search}</span>
          <span className="seh-search-label">Search anything…</span>
        </button>
      </Tooltip>

      <div className="seh-actions">
        <Tooltip
          text={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
          placement="bottom"
        >
          <button
            type="button"
            className="seh-save"
            onClick={save}
            disabled={!hasUnsavedChanges}
          >
            Save
          </button>
        </Tooltip>
        <Tooltip text={statusLabel} placement="bottom">
          <span
            className={`seh-status ${isLive ? 'is-live' : 'is-private'}`}
            role="status"
            aria-label={statusLabel}
          >
            <span className="seh-status-dot" aria-hidden="true" />
          </span>
        </Tooltip>
      </div>
    </header>
  );
}

export default SiteEditorHeader;
