import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@wordpress/components';
import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  wordpress,
} from '@wordpress/icons';

const ITEMS = [
  { id: 'home', icon: home, label: 'Home', path: '/' },
  { id: 'posts', icon: postList, label: 'Posts', path: '/posts' },
  { id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages' },
  { id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation' },
  { id: 'design', icon: styles, label: 'Design', path: '/design' },
];

function InCanvasNav() {
  const navigate = useNavigate();

  return (
    <div className="sidebar collapsed">
      <nav className="admin-root-nav">
        {ITEMS.map((item) => (
          <Tooltip key={item.id} text={item.label} placement="right">
            <div className="ni" onClick={() => navigate(item.path)}>
              <span className="ni-ico">{item.icon}</span>
              <span className="ni-label">{item.label}</span>
            </div>
          </Tooltip>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Tooltip text="Return to WordPress dashboard" placement="top">
          <button type="button" className="sb-dashboard">
            <span className="sb-dashboard-ico" aria-hidden="true">{wordpress}</span>
            <span className="sb-dashboard-label">Dashboard</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default InCanvasNav;
