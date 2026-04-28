import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '@wordpress/components';
import { desktop, tablet, mobile, chevronDown } from '@wordpress/icons';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, selectedDevice, setSelectedDevice, siteTitle } = useAppState();

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit`);
  };

  const suggestions = [
    { id: 'first-post', label: 'Create your first post' },
    { id: 'site-identity', label: 'Customize your site identity' },
    { id: 'styles', label: 'Style every corner of your site' },
  ];

  return (
    <div className="home-view">
      <div className="hv-heading-row">
        <h1 className="hv-welcome">Welcome back, Fran</h1>
        <button className="hv-site-preview" type="button">
          <span>Site preview</span>
          <span className="hv-chevron">{chevronDown}</span>
        </button>
      </div>

      <div className="hv-preview-canvas">
        <div className="hv-preview-bar">
          <Button
            variant="primary"
            className="hv-edit-btn"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <span className="hv-page-name">{currentPage.name}</span>
          <div className="hv-device-switcher">
            <Button
              className={`hv-device-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('mobile')}
              label="Mobile view"
              icon={mobile}
              iconSize={20}
            />
            <Button
              className={`hv-device-btn ${selectedDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('tablet')}
              label="Tablet view"
              icon={tablet}
              iconSize={20}
            />
            <Button
              className={`hv-device-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('desktop')}
              label="Desktop view"
              icon={desktop}
              iconSize={20}
            />
          </div>
        </div>

        <div className="hv-preview-area">
          <div className="site-card">
            <div className="p-header">
              <span className="p-sitename">{siteTitle}</span>
              <div className="p-nav">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Gallery</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div className="p-hero">
              <div>
                <h1>Capturing moments<br />that last forever</h1>
                <p>Fine art & portrait photography · London</p>
              </div>
            </div>
            <div className="p-section">
              <div className="p-st">About my work</div>
              <div className="p-body">
                I specialise in candid portraiture and landscape photography. My work focuses on natural light and authentic emotion — the moments that tell a real story.
              </div>
            </div>
            <div className="p-section">
              <div className="p-st">Recent work</div>
              <div className="p-grid">
                <div className="p-img"></div>
                <div className="p-img"></div>
                <div className="p-img"></div>
              </div>
            </div>
            <div className="p-footer">
              <span className="p-ft">© 2026 {siteTitle}</span>
              <span className="p-ft">Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hv-suggestions">
        <div className="hv-suggestions-header">
          <span className="hv-suggestions-title">Learn the basics</span>
          <div className="hv-suggestions-actions">
            <button type="button" className="hv-suggestions-action">Hide</button>
            <button type="button" className="hv-suggestions-action">Dismiss</button>
          </div>
        </div>
        <div className="hv-banners">
          {suggestions.map((s) => (
            <div key={s.id} className="hv-banner">
              <span className="hv-banner-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreviewView;
