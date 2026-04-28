import { useAppState } from '../hooks/useAppState';
import PagesStrip from './PagesStrip';
import { siteData } from '../data/mockData';
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
  const { sidebarCollapsed, toggleSidebar, currentView, setCurrentView, openSiteIdentityModal } = useAppState();

  const navItems = [
    { id: 'home', icon: home, label: 'Home', view: 'preview', tip: "View your site's home page" },
    { id: 'pages', icon: pageIcon, label: 'Pages', view: 'pages', tip: "View your site's Pages" },
    { id: 'content', icon: postList, label: 'Content', view: null, tip: 'Manage Content on your site' },
    { id: 'navigation', icon: navigation, label: 'Navigation', view: null, tip: 'Manage your navigation menus' },
    { id: 'site-identity', icon: siteLogo, label: 'Site Identity', view: null, tip: 'Update your website information' },
    { id: 'design', icon: styles, label: 'Design', view: null, tip: 'Modify your site design and styling' },
  ];

  const handleNavClick = (view) => {
    if (view) {
      setCurrentView(view);
    }
  };

  const isActive = (itemView) => {
    if (itemView === 'preview') {
      return currentView === 'preview' || currentView === 'editing' || currentView === 'inserter';
    }
    return currentView === itemView;
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
      <div className="dash-link" data-tip="Go to WordPress Admin">
        <span className="dash-ico">
          {wordpress}
        </span>
        <span className="dash-label">Dashboard</span>
      </div>

      {/* Nav items */}
      <nav className="nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`ni ${isActive(item.view) ? 'on' : ''}`}
            onClick={() => handleNavClick(item.view)}
            data-tip={item.tip}
          >
            <span className="ni-ico">
              {item.icon}
            </span>
            <span className="ni-label">{item.label}</span>
          </div>
        ))}
        <div className="divider"></div>
        <div className="ni ni-adv" data-tip="Advanced site settings">
          <span className="ni-ico">
            {settings}
          </span>
          <span className="ni-label">Advanced</span>
        </div>
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
