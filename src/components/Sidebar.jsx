import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  settings,
  chevronRight,
  wordpress,
} from '@wordpress/icons';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppState();

  const navItems = [
    { id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
    { id: 'posts', icon: postList, label: 'Posts', path: '/posts', tip: 'Manage Posts on your site' },
    { id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
    { id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation', tip: 'Manage your navigation menus' },
    { id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling', chevron: true },
  ];

  const handleNavClick = (item) => {
    if (item.path) navigate(item.path);
  };

  const isActive = (itemPath) => {
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname.includes('/edit');
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Admin root navigation — single flat group per Figma 40:1381 */}
      <nav className="admin-root-nav">
        {navItems.map((item) => (
          <Tooltip key={item.id} text={item.tip} placement="right">
            <div
              className={`ni ${item.chevron ? 'ni-with-chevron' : ''} ${isActive(item.path) ? 'on' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span className="ni-ico">{item.icon}</span>
              <span className="ni-label">{item.label}</span>
              {item.chevron && <span className="ni-chevron">{chevronRight}</span>}
            </div>
          </Tooltip>
        ))}
      </nav>

      {/* Dashboard link + sidebar customization */}
      <div className="sidebar-bottom">
        <Tooltip text="Return to WordPress dashboard" placement="top">
          <button type="button" className="sb-dashboard">
            <span className="sb-dashboard-ico" aria-hidden="true">{wordpress}</span>
            <span className="sb-dashboard-label">Dashboard</span>
          </button>
        </Tooltip>
        <Tooltip text="Customize navigation" placement="top">
          <button
            type="button"
            className="sb-customize"
            aria-label="Customize navigation"
          >
            {settings}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Sidebar;
