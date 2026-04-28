import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import UrlBar from '../shared/UrlBar';
import SectionInserter from './SectionInserter';

function EditingView() {
  const { currentPage, currentView, setCurrentView } = useAppState();
  const [selectedSection, setSelectedSection] = useState(1);

  const isInserterOpen = currentView === 'inserter';

  return (
    <div className={`edit-canvas ${true ? 'show' : ''}`}>
      {/* Section inserter */}
      <SectionInserter />

      {/* Editor column */}
      <div className="editor-col">
        {/* Canvas toolbar */}
        <div className="canvas-toolbar">
          <button 
            className="ct-btn primary" 
            onClick={() => setCurrentView(isInserterOpen ? 'editing' : 'inserter')}
          >
            + Add
          </button>
          <div className="ct-sep"></div>
          <button className="ct-btn" title="List view">≡</button>
          <button className="ct-btn" title="Undo">↩</button>
          <button className="ct-btn" title="Redo">↪</button>
          <div className="ct-space"></div>
          <UrlBar page={currentPage} />
          <div className="ct-space"></div>
          <button 
            className="ct-exit" 
            onClick={() => setCurrentView('preview')}
          >
            ← Done editing
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
