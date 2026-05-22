import { Tooltip } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { search, pencil } from '@wordpress/icons';
import { useAppState } from '../hooks/useAppState';
import siteLogo from '../assets/site-logo.png';

function SiteEditorHeader() {
  const {
    siteTitle,
    openSiteIdentityModal,
    openCommandPalette,
    hasUnsavedChanges,
    openUnsavedChangesModal,
    siteStatus,
  } = useAppState();

  const isLive = siteStatus === 'live';
  const statusLabel = isLive ? 'Site is live' : 'Site is private';

  return (
    <header className="site-editor-header">
      {/* Site identity — single edit affordance matching trunk's
          sidebar site-anchor: logo + title + pencil-on-hover. */}
      <Stack direction="row" align="center" className="seh-anchor">
        <Tooltip text="Edit site identity" placement="bottom">
          <button
            type="button"
            className="seh-identity"
            onClick={openSiteIdentityModal}
            aria-label="Edit site identity"
          >
            <Stack direction="row" align="center" gap="sm">
              <img className="seh-logo" src={siteLogo} alt="" aria-hidden="true" />
              <Text variant="body-md" className="seh-title">{siteTitle}</Text>
              <span className="seh-pencil" aria-hidden="true">{pencil}</span>
            </Stack>
          </button>
        </Tooltip>
      </Stack>

      <Tooltip text="Search (⌘K)" placement="bottom">
        <button
          type="button"
          className="seh-search"
          onClick={openCommandPalette}
          aria-label="Open command palette"
        >
          <Stack direction="row" align="center" gap="xs">
            <span className="seh-search-icon" aria-hidden="true">{search}</span>
            <Text variant="body-md" className="seh-search-label">Search anything…</Text>
          </Stack>
        </button>
      </Tooltip>

      <Stack direction="row" align="center" gap="sm" className="seh-actions">
        <Tooltip
          text={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
          placement="bottom"
        >
          <button
            type="button"
            className="seh-save"
            onClick={openUnsavedChangesModal}
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
      </Stack>
    </header>
  );
}

export default SiteEditorHeader;
