const icons = {
  home: 'M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z',
  page: 'M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5ZM17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z'
};

function PageRow({ page: pageData, onClick }) {
  const isHome = pageData.id === 'home';
  
  return (
    <div className="pi" onClick={() => onClick && onClick(pageData)}>
      <span className={`pi-ico ${isHome ? 'home-ico' : ''}`}>
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
          <path d={isHome ? icons.home : icons.page} />
        </svg>
      </span>
      <span className={`pi-name ${pageData.isSystem ? 'sys' : ''}`}>
        {pageData.name}
      </span>
      <div className="pi-badges">
        {pageData.isLive && !pageData.isSystem && (
          <span className="pi-live-dot"></span>
        )}
        {!pageData.isLive && <span className="pb pb-draft">Draft</span>}
        {pageData.inMenu && <span className="pb pb-nav">Menu</span>}
        {pageData.badge === 'System' && <span className="pb pb-sys">System</span>}
        {pageData.badge === 'WooCommerce' && <span className="pb pb-woo">WooCommerce</span>}
      </div>
    </div>
  );
}

export default PageRow;
