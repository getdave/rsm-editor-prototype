import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button, ButtonGroup } from '@wordpress/components';
import { undo, redo, desktop, tablet, mobile, drawerRight, moreVertical, plus, listView } from '@wordpress/icons';
import UrlBar from '../shared/UrlBar';
import SectionInserter from './SectionInserter';

function EditingView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPage, hasUnsavedChanges, save, selectedDevice, setSelectedDevice, siteTitle } = useAppState();
  const [selectedSection, setSelectedSection] = useState(1);

  const isInserterOpen = searchParams.get('inserter') === 'true';
  
  const toggleInserter = () => {
    if (isInserterOpen) {
      searchParams.delete('inserter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ inserter: 'true' });
    }
  };

  return (
    <div className={`edit-canvas ${true ? 'show' : ''}`}>
      {/* Section inserter */}
      <SectionInserter />

      {/* Editor column */}
      <div className="editor-col">
        {/* Canvas toolbar */}
        <div className="canvas-toolbar">
          {/* Left side controls */}
          <Button 
            variant="primary"
            className="ct-btn primary" 
            onClick={toggleInserter}
            icon={plus}
            iconSize={20}
          />
          <Button 
            className="ct-btn" 
            label="Undo"
            icon={undo}
            iconSize={20}
          />
          <Button 
            className="ct-btn" 
            label="Redo"
            icon={redo}
            iconSize={20}
          />
          <Button 
            className="ct-btn" 
            label="Document Overview"
            icon={listView}
            iconSize={20}
          />
          
          <div className="ct-space"></div>
          <UrlBar page={currentPage} />
          <div className="ct-space"></div>
          
          {/* Right side controls */}
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
            className="ct-icon-btn" 
            label="Toggle settings sidebar"
            icon={drawerRight}
            iconSize={20}
          />
          
          <Button 
            className="ct-icon-btn" 
            label="More options"
            icon={moreVertical}
            iconSize={20}
          />
          
          {!hasUnsavedChanges && <span className="ct-saved">Saved</span>}
          <Button 
            variant="primary"
            className={`ct-save ${hasUnsavedChanges ? 'show' : ''}`}
            onClick={save}
          >
            Save
          </Button>
          <Button 
            className="ct-exit" 
            onClick={() => navigate('/')}
          >
            Exit
          </Button>
        </div>

        {/* Edit scroll area */}
        <div className="edit-scroll">
          <div className="edit-card">
            {/* Header (global) */}
            <div className="sec-group">
              <div className="g-el p-header">
                <span className="p-sitename">{siteTitle}</span>
                <div className="p-nav">
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none' }}>Home</a>
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none', marginLeft: '14px' }}>About</a>
                </div>
                <div className="g-badge">⟳ Global — Header</div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setSearchParams({ inserter: 'true' })}
              >
                + Add section
              </button>
            </div>

            {/* Hero section */}
            <div className="sec-group">
              <div 
                className={`e-sec ${selectedSection === 1 ? 'sel' : ''}`}
                onClick={() => setSelectedSection(1)}
              >
                <div className="sec-bar">
                  <button className="sb-btn">↑</button>
                  <button className="sb-btn">↓</button>
                  <div className="sb-div"></div>
                  <button className="sb-btn">Change design</button>
                  <div className="sb-div"></div>
                  <button className="sb-btn" style={{ color: '#f87171' }}>Delete</button>
                </div>
                <div className="p-hero">
                  <div>
                    <h1>Capturing moments<br />that last forever</h1>
                    <p>Fine art & portrait photography · London</p>
                  </div>
                </div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setSearchParams({ inserter: 'true' })}
              >
                + Add section
              </button>
            </div>

            {/* About section */}
            <div className="sec-group">
              <div 
                className="e-sec"
                onClick={() => setSelectedSection(2)}
              >
                <div className="p-section">
                  <div className="p-st">About my work</div>
                  <div className="p-body">I specialise in candid portraiture and landscape photography.</div>
                </div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setSearchParams({ inserter: 'true' })}
              >
                + Add section
              </button>
            </div>

            {/* Recent work section */}
            <div className="sec-group">
              <div 
                className="e-sec"
                onClick={() => setSelectedSection(3)}
              >
                <div className="p-section">
                  <div className="p-st">Recent work</div>
                  <div className="p-grid">
                    <div className="p-img"></div>
                    <div className="p-img"></div>
                    <div className="p-img"></div>
                  </div>
                </div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setSearchParams({ inserter: 'true' })}
              >
                + Add section
              </button>
            </div>

            {/* Footer (global) */}
            <div className="g-el p-footer" style={{ position: 'relative' }}>
              <span className="p-ft">© 2026 {siteTitle}</span>
              <span className="p-ft">Privacy Policy</span>
              <div className="g-badge">⟳ Global — Footer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditingView;
