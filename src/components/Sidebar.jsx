import { useAppState } from '../hooks/useAppState';
import PagesStrip from './PagesStrip';
import { siteData } from '../data/mockData';

// WordPress icon SVG paths
const icons = {
  home: 'M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z',
  page: 'M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5ZM17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z',
  postList: 'M18 5.5H6a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5ZM6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 5h1.5v1.5H7V9Zm1.5 4.5H7V15h1.5v-1.5ZM10 9h7v1.5h-7V9Zm7 4.5h-7V15h7v-1.5Z',
  navigation: 'M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.5c-3.6 0-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5s6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5zM9 16l4.5-3L15 8.4l-4.5 3L9 16z',
  siteLogo: 'M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm0 1.5c3.4 0 6.2 2.7 6.5 6l-1.2-.6-.8-.4c-.1 0-.2 0-.3-.1H16c-.1-.2-.4-.2-.7 0l-2.9 2.1L9 11.3h-.7L5.5 13v-1.1c0-3.6 2.9-6.5 6.5-6.5Zm0 13c-2.7 0-5-1.7-6-4l2.8-1.7 3.5 1.2h.4s.2 0 .4-.2l2.9-2.1.4.2c.6.3 1.4.7 2.1 1.1-.5 3.1-3.2 5.4-6.4 5.4Z',
  styles: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 0 1-6.5 6.5v-13a6.5 6.5 0 0 1 6.5 6.5Z',
  settings: 'm19 7.5h-7.628c-.3089-.87389-1.1423-1.5-2.122-1.5-.97966 0-1.81309.62611-2.12197 1.5h-2.12803v1.5h2.12803c.30888.87389 1.14231 1.5 2.12197 1.5.9797 0 1.8131-.62611 2.122-1.5h7.628zm0 7.5h-2.128c-.3089-.8739-1.1423-1.5-2.122-1.5s-1.8131.6261-2.122 1.5h-7.628v1.5h7.628c.3089.8739 1.1423 1.5 2.122 1.5s1.8131-.6261 2.122-1.5h2.128z',
  arrowLeft: 'M20 11.2H6.8l3.7-3.7-1-1L3.9 12l5.6 5.5 1-1-3.7-3.7H20z',
  chevronLeft: 'M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z',
  chevronRight: 'M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z'
};

const WPIcon = ({ path, ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d={path} />
  </svg>
);

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentView, setCurrentView, openSiteIdentityModal } = useAppState();

  const navItems = [
    { id: 'home', icon: icons.home, label: 'Home', view: 'preview', tip: 'Home' },
    { id: 'pages', icon: icons.page, label: 'Pages', view: 'pages', tip: 'Pages' },
    { id: 'content', icon: icons.postList, label: 'Content', view: null, tip: 'Content' },
    { id: 'navigation', icon: icons.navigation, label: 'Navigation', view: null, tip: 'Navigation' },
    { id: 'site-identity', icon: icons.siteLogo, label: 'Site Identity', view: null, tip: 'Site Identity' },
    { id: 'design', icon: icons.styles, label: 'Design', view: null, tip: 'Design' },
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
      <div className="dash-link" data-tip="Dashboard">
        <span className="dash-ico">
          <WPIcon path={icons.arrowLeft} style={{ width: 16, height: 16, fill: 'currentColor' }} />
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
              <WPIcon path={item.icon} style={{ width: 16, height: 16, fill: 'currentColor' }} />
            </span>
            <span className="ni-label">{item.label}</span>
          </div>
        ))}
        <div className="divider"></div>
        <div className="ni ni-adv" data-tip="Advanced">
          <span className="ni-ico">
            <WPIcon path={icons.settings} style={{ width: 16, height: 16, fill: 'currentColor' }} />
          </span>
          <span className="ni-label">Advanced</span>
        </div>
      </nav>

      {/* Pages strip */}
      <PagesStrip />

      {/* Pages collapsed icon */}
      {sidebarCollapsed && (
        <div className="pages-collapsed" data-tip="Pages">
          <WPIcon path={icons.page} style={{ width: 16, height: 16, fill: 'currentColor' }} />
        </div>
      )}
    </div>
  );
}

export default Sidebar;
