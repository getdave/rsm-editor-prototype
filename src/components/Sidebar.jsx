import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import PagesStrip from './PagesStrip';
import { siteData } from '../data/mockData';
import { Tooltip } from '@wordpress/components';
import { 
  wordpress,
  home,
  page as pageIcon,
  postList,
  navigation,
  siteLogo,
  styles,
  settings,
  arrowLeft
} from '@wordpress/icons';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, openSiteIdentityModal } = useAppState();

  const navItems = [
    { id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
    { id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
    { id: 'content', icon: postList, label: 'Content', path: '/content', tip: 'Manage Content on your site' },
    { id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation', tip: 'Manage your navigation menus' },
    { id: 'site-identity', icon: siteLogo, label: 'Site Identity', path: null, tip: 'Update your website information' },
    { id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling' },
  ];

  const handleNavClick = (item) => {
    if (item.id === 'site-identity') {
      openSiteIdentityModal();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (itemPath) => {
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname.includes('/edit');
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Site anchor with W logo */}
      <div className="site-anchor">
        <div className="wp-logo" onClick={openSiteIdentityModal}>
          W
          <div className="wp-logo-ov">
            <svg style={{ width: 11, height: 11, fill: '#fff' }} viewBox="0 0 24 24">
              <path d="M20.1 5.1L16.9 2 6.2 12.7l-1.9 7.1 7.1-1.9L20.1 8.3V5.1zm-1.3 2.8l-3.4 3.4-2.6-2.6 3.4-3.4 2.6 2.6z"/>
            </svg>
          </div>
          <span className="wp-logo-tip">Edit logo</span>
        </div>
        <span className="site-name">{siteData.name}</span>
      </div>

      {/* Back to Dashboard */}
      <Tooltip text="Go to WordPress Admin" placement="right">
        <div className="dash-link">
          <span className="dash-ico">
            {wordpress}
          </span>
          <span className="dash-label">Dashboard</span>
        </div>
      </Tooltip>

      {/* Nav items */}
      <nav className="nav">
        {navItems.map((item) => (
          <Tooltip key={item.id} text={item.tip} placement="right">
            <div
              className={`ni ${isActive(item.path) ? 'on' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span className="ni-ico">
                {item.icon}
              </span>
              <span className="ni-label">{item.label}</span>
            </div>
          </Tooltip>
        ))}
        <div className="divider"></div>
        <Tooltip text="Advanced site settings" placement="right">
          <div className="ni ni-adv">
            <span className="ni-ico">
              {settings}
            </span>
            <span className="ni-label">Advanced</span>
          </div>
        </Tooltip>
      </nav>

      {/* Pages strip */}
      <PagesStrip />

      {/* Pages collapsed icon */}
      {sidebarCollapsed && (
        <div className="pages-collapsed" data-tip="Pages">
          {pageIcon}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
