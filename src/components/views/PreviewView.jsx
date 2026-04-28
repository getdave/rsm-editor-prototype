import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import UrlBar from '../shared/UrlBar';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, selectedDevice, setSelectedDevice, siteTitle } = useAppState();

  return (
    <div className="canvas" style={{ flexDirection: 'column', padding: 0 }}>
      <div className="preview-bar">
        <div className="ct-space"></div>
        <UrlBar page={currentPage} />
        <div className="ct-space"></div>
        
        <div className="ct-view-modes">
          <Button 
            className={`ct-view-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('desktop')}
            label="Desktop view"
            icon={desktop}
            iconSize={20}
          />
          <Button 
            className={`ct-view-btn ${selectedDevice === 'tablet' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('tablet')}
            label="Tablet view"
            icon={tablet}
            iconSize={20}
          />
          <Button 
            className={`ct-view-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('mobile')}
            label="Mobile view"
            icon={mobile}
            iconSize={20}
          />
        </div>
        
        <Button 
          variant="primary"
          className="ct-edit" 
          onClick={() => navigate(`/pages/${currentPage.id}/edit`)}
        >
          Edit
        </Button>
      </div>
      <div className="preview-canvas-area">
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
            <span className="p-ft">© 2026 My Photography Site</span>
            <span className="p-ft">Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewView;
