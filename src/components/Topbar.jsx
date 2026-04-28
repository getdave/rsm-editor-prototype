import { useAppState } from '../hooks/useAppState';
import { Button } from '@wordpress/components';
import { search } from '@wordpress/icons';

function Topbar() {
  const { siteTitle, hasUnsavedChanges, save, openSiteIdentityModal } = useAppState();

  return (
    <div className="admin-header">
      <div className="ah-anchor">
        <div className="ah-logo" onClick={openSiteIdentityModal}></div>
        <span className="ah-site-title">{siteTitle}</span>
      </div>

      <div className="ah-search">
        <span className="ah-search-icon">{search}</span>
        <span className="ah-search-text">Search anything…</span>
      </div>

      <div className="ah-actions">
        <Button
          variant="primary"
          className={`ah-save ${hasUnsavedChanges ? '' : 'is-disabled'}`}
          onClick={save}
          disabled={!hasUnsavedChanges}
        >
          Save
        </Button>
        <span className="ah-status-dot" title="Site is live"></span>
      </div>
    </div>
  );
}

export default Topbar;
