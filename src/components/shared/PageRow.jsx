import { home, page as pageIcon } from '@wordpress/icons';

function PageRow({ page: pageData, onClick }) {
  const isHome = pageData.id === 'home';
  
  return (
    <div className="pi" onClick={() => onClick && onClick(pageData)}>
      <span className={`pi-ico ${isHome ? 'home-ico' : ''}`}>
        {isHome ? home : pageIcon}
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
