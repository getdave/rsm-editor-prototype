import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { Button } from '@wordpress/components';
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
  arrowLeft,
  pencil,
  people,
  chevronRight,
  layout,
  symbol
} from '@wordpress/icons';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, openSiteIdentityModal, siteTitle, setSiteTitle } = useAppState();
  const [isEditingSiteName, setIsEditingSiteName] = useState(false);
  const [editedSiteName, setEditedSiteName] = useState(siteTitle);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);

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

  const handleSiteNameClick = () => {
    setEditedSiteName(siteTitle);
    setIsEditingSiteName(true);
  };

  const handleSiteNameSave = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmChange = () => {
    setSiteTitle(editedSiteName);
    setIsEditingSiteName(false);
    setShowConfirmModal(false);
  };

  const handleCancelChange = () => {
    setEditedSiteName(siteTitle);
    setIsEditingSiteName(false);
    setShowConfirmModal(false);
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
        {!isEditingSiteName ? (
          <Tooltip text="Edit site title" placement="right">
            <div className="site-name-wrapper" onClick={handleSiteNameClick}>
              <span className="site-name">
                {siteTitle}
              </span>
              <span className="site-name-edit-icon">
                {pencil}
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className="site-name-edit">
            <input 
              type="text" 
              className="site-name-input"
              value={editedSiteName}
              onChange={(e) => setEditedSiteName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSiteNameSave();
                if (e.key === 'Escape') handleCancelChange();
              }}
              onBlur={(e) => {
                // Only cancel if not clicking the Save button
                if (!e.relatedTarget?.classList.contains('site-name-save-btn')) {
                  handleCancelChange();
                }
              }}
            />
            <Button 
              variant="primary" 
              size="small"
              className="site-name-save-btn"
              onClick={handleSiteNameSave}
              onMouseDown={(e) => e.preventDefault()}
            >
              Save
            </Button>
          </div>
        )}
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
      </nav>

      {/* Spacer to push Advanced menu to bottom */}
      <div style={{ flex: 1 }} />

      {/* Advanced menu item with flyout */}
      <div className="ni-adv-wrapper">
        <div 
          className="ni ni-adv"
          onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
        >
          <span className="ni-label">Advanced</span>
          <span className="ni-arrow">
            {chevronRight}
          </span>
        </div>
        
        {showAdvancedMenu && (
          <>
            <div 
              className="advanced-overlay" 
              onClick={() => setShowAdvancedMenu(false)}
            />
            <div className="advanced-flyout">
              <Tooltip text="Manage page templates" placement="right">
                <div className="af-item">
                  <span className="af-icon">{layout}</span>
                  <span className="af-label">Templates</span>
                </div>
              </Tooltip>
              <Tooltip text="Manage design patterns" placement="right">
                <div className="af-item">
                  <span className="af-icon">{symbol}</span>
                  <span className="af-label">Patterns</span>
                </div>
              </Tooltip>
              <Tooltip text="Manage template parts" placement="right">
                <div className="af-item">
                  <span className="af-icon">{layout}</span>
                  <span className="af-label">Template Parts</span>
                </div>
              </Tooltip>
            </div>
          </>
        )}
      </div>

      {/* Bottom section - User profile and Settings */}
      <div className="sidebar-bottom">
        <Tooltip text="User profile" placement="top">
          <div className="sb-user">
            <div className="sb-avatar">DS</div>
          </div>
        </Tooltip>
        <Tooltip text="Settings" placement="top">
          <div className="sb-settings">
            {settings}
          </div>
        </Tooltip>
      </div>

      {/* Site name change confirmation modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelChange}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Change Site Title?</h3>
            <p className="modal-message">
              Changing your site title will update it across your entire site, including the header, footer, and browser tab.
            </p>
            <p className="modal-new-value">
              New title: <strong>{editedSiteName}</strong>
            </p>
            <div className="modal-actions">
              <Button onClick={handleCancelChange}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmChange}>
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
