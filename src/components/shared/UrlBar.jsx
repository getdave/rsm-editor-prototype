function UrlBar({ page }) {
  return (
    <div className="url-bar">
      <span className="url-slug">/{page.slug}</span>
      <span className="url-pipe"></span>
      <span className="url-entity">{page.name}</span>
      <span className="url-type">{page.type}</span>
      <span className={`url-dot ${!page.isLive ? 'url-draft-dot' : ''}`}></span>
      <span className={`url-status ${!page.isLive ? 'url-draft' : ''}`}>
        {page.isLive ? 'Live' : 'Draft'}
      </span>
    </div>
  );
}

export default UrlBar;
