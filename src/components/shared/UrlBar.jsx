import { Tooltip } from '@wordpress/components';

function UrlBar({ page }) {
  const statusLabel = page.isLive ? 'Page is published' : 'Page is a draft';

  return (
    <div className="url-bar">
      <span className="url-slug">/{page.slug}</span>
      <span className="url-pipe"></span>
      <span className="url-entity">{page.name}</span>
      <span className="url-type">{page.type}</span>
      <Tooltip text={statusLabel} placement="top">
        <span
          className={`url-dot ${!page.isLive ? 'url-draft-dot' : ''}`}
          role="status"
          aria-label={statusLabel}
        ></span>
      </Tooltip>
      <span className={`url-status ${!page.isLive ? 'url-draft' : ''}`}>
        {page.isLive ? 'Published' : 'Draft'}
      </span>
    </div>
  );
}

export default UrlBar;
