import { home, page as pageIcon } from '@wordpress/icons';
import LiveBadge from './LiveBadge';

function PageRow({ page: pageData, onClick }) {
  const isHome = pageData.id === 'home';

  return (
    <div className="pi" onClick={() => onClick && onClick(pageData)}>
      <span className="pi-media-thumb">
        <span className="pi-ico">
          {isHome ? home : pageIcon}
        </span>
        {pageData.isFrontPage ? (
          <span className="pp-front-page-overlay">Front page</span>
        ) : null}
      </span>
      <span className={`pi-name ${pageData.isSystem ? 'sys' : ''}`}>
        {pageData.name}
      </span>
      <div className="pi-badges">
        {pageData.isLive && !pageData.isSystem && <LiveBadge />}
        {!pageData.isLive && <span className="pb pb-draft">Draft</span>}
        {pageData.inMenu && <span className="pb pb-nav">Main Menu</span>}
        {pageData.badge === 'WordPress' && <span className="pb pb-wp">WordPress</span>}
        {pageData.badge === 'Theme' && <span className="pb pb-theme">Theme</span>}
        {pageData.badge === 'WooCommerce' && <span className="pb pb-woo">WooCommerce</span>}
      </div>
    </div>
  );
}

export default PageRow;
