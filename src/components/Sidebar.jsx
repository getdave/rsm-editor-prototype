import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { Tooltip } from '@wordpress/components';
import {
  home,
  page as pageIcon,
  postList,
  image,
  styles,
  plugins,
  settings,
  chevronRight,
} from '@wordpress/icons';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useAppState();

  const primaryNavItems = [
    { id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
    { id: 'posts', icon: postList, label: 'Posts', path: '/posts', tip: 'Manage Posts on your site' },
    { id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
    { id: 'media', icon: image, label: 'Media', path: '/media', tip: 'Manage Media on your site' },
  ];

  const bottomNavItems = [
    { id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling' },
    { id: 'plugins', icon: plugins, label: 'Plugins', path: '/plugins', tip: 'Manage your plugins' },
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
      <div className="admin-root-nav">
        <nav className="nav nav-primary">
          {primaryNavItems.map((item) => (
            <Tooltip key={item.id} text={item.tip} placement="right">
              <div
                className={`ni ${isActive(item.path) ? 'on' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span className="ni-ico">{item.icon}</span>
                <span className="ni-label">{item.label}</span>
              </div>
            </Tooltip>
          ))}
        </nav>

        <nav className="nav nav-bottom">
          {bottomNavItems.map((item) => (
            <Tooltip key={item.id} text={item.tip} placement="right">
              <div
                className={`ni ni-with-chevron ${isActive(item.path) ? 'on' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span className="ni-ico">{item.icon}</span>
                <span className="ni-label">{item.label}</span>
                <span className="ni-chevron">{chevronRight}</span>
              </div>
            </Tooltip>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <Tooltip text="User profile" placement="top">
          <div className="sb-user">
            <div className="sb-avatar">DS</div>
          </div>
        </Tooltip>
        <Tooltip text="Settings" placement="top">
          <div className="sb-settings">{settings}</div>
        </Tooltip>
      </div>
    </div>
  );
}

export default Sidebar;
