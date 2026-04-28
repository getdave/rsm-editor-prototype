import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import UrlBar from '../shared/UrlBar';
import SectionInserter from './SectionInserter';

function EditingView() {
  const { currentPage, currentView, setCurrentView, hasUnsavedChanges, save } = useAppState();
  const [selectedSection, setSelectedSection] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState('desktop');

  const isInserterOpen = currentView === 'inserter';

  return (
    <div className={`edit-canvas ${true ? 'show' : ''}`}>
      {/* Section inserter */}
      <SectionInserter />

      {/* Editor column */}
      <div className="editor-col">
        {/* Canvas toolbar */}
        <div className="canvas-toolbar">
          {/* Left side controls */}
          <button 
            className="ct-btn primary" 
            onClick={() => setCurrentView(isInserterOpen ? 'editing' : 'inserter')}
          >
            +
          </button>
          <button className="ct-btn" title="Undo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 11.7c-1.2-1.2-2.8-1.9-4.5-1.9H8.8l2.4-2.4-1.4-1.4-4.5 4.5 4.5 4.5 1.4-1.4-2.4-2.4h5c2.5 0 4.6 2.1 4.6 4.6s-2.1 4.6-4.6 4.6H8v2h5.8c3.6 0 6.5-2.9 6.5-6.5s-2.9-6.5-6.5-6.5-.5 0-.5-.3z"/>
            </svg>
          </button>
          <button className="ct-btn" title="Redo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 6.5l-1.4 1.4 2.4 2.4h-5c-1.7 0-3.3.7-4.5 1.9-1.2 1.2-1.9 2.8-1.9 4.5s.7 3.3 1.9 4.5c1.2 1.2 2.8 1.9 4.5 1.9H16v-2h-4.2c-1.3 0-2.4-.5-3.2-1.4-.8-.8-1.4-2-1.4-3.2s.5-2.4 1.4-3.2c.8-.8 2-1.4 3.2-1.4h5l-2.4 2.4 1.4 1.4 4.5-4.5-4.7-4.7z"/>
            </svg>
          </button>
          
          <div className="ct-space"></div>
          <UrlBar page={currentPage} />
          <div className="ct-space"></div>
          
          {/* Right side controls */}
          <div className="ct-view-modes">
            <button 
              className={`ct-view-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('desktop')}
              title="Desktop view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 16h-17A.5.5 0 0 1 3 15.5v-11a.5.5 0 0 1 .5-.5h17a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5zM4.5 3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7.25v2h-1.5v1.5h4v-1.5h-1.5v-2H20.5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-16z"/>
              </svg>
            </button>
            <button 
              className={`ct-view-btn ${selectedDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('tablet')}
              title="Tablet view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm.5 14c0 .3-.2.5-.5.5H7c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h10c.3 0 .5.2.5.5v12z"/>
              </svg>
            </button>
            <button 
              className={`ct-view-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('mobile')}
              title="Mobile view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 4H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm.5 14c0 .3-.2.5-.5.5H9c-.3 0-.5-.2-.5-.5V6c0-.3.2-.5.5-.5h6c.3 0 .5.2.5.5v12z"/>
              </svg>
            </button>
          </div>
          
          <button className="ct-icon-btn" title="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 5.5H6a.5.5 0 0 0-.5.5v3h13V6a.5.5 0 0 0-.5-.5zm.5 5H10v8h8a.5.5 0 0 0 .5-.5v-7.5zM6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            </svg>
          </button>
          
          <button className="ct-icon-btn" title="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/>
            </svg>
          </button>
          
          {!hasUnsavedChanges && <span className="ct-saved">Saved</span>}
          <button 
            className={`ct-save ${hasUnsavedChanges ? 'show' : ''}`}
            onClick={save}
          >
            Save
          </button>
          <button 
            className="ct-exit" 
            onClick={() => setCurrentView('preview')}
          >
            Exit
          </button>
        </div>

        {/* Edit scroll area */}
        <div className="edit-scroll">
          <div className="edit-card">
            {/* Header (global) */}
            <div className="sec-group">
              <div className="g-el p-header">
                <span className="p-sitename">My Photography Site</span>
                <div className="p-nav">
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none' }}>Home</a>
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none', marginLeft: '14px' }}>About</a>
                </div>
                <div className="g-badge">⟳ Global — Header</div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setCurrentView('inserter')}
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
                onClick={() => setCurrentView('inserter')}
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
                onClick={() => setCurrentView('inserter')}
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
                onClick={() => setCurrentView('inserter')}
              >
                + Add section
              </button>
            </div>

            {/* Footer (global) */}
            <div className="g-el p-footer" style={{ position: 'relative' }}>
              <span className="p-ft">© 2026 My Photography Site</span>
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
