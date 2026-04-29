import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button, ButtonGroup } from '@wordpress/components';
import { undo, redo, desktop, tablet, mobile, drawerRight, moreVertical, plus, listView } from '@wordpress/icons';
import UrlBar from '../shared/UrlBar';
import SectionInserter from './SectionInserter';
import { getEditModeContent } from '../../services/pageContentService';

function EditingView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPage, hasUnsavedChanges, save, selectedDevice, setSelectedDevice, siteTitle } = useAppState();
  const [selectedSection, setSelectedSection] = useState(1);
  
  // Get page-specific content for editing
  const content = getEditModeContent(currentPage);

  const isInserterOpen = searchParams.get('inserter') === 'true';
  
  const toggleInserter = () => {
    if (isInserterOpen) {
      searchParams.delete('inserter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ inserter: 'true' });
    }
  };

  // Render section content based on type
  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="p-hero">
            <div>
              <h1>{section.content.title}</h1>
              {section.content.subtitle && <p>{section.content.subtitle}</p>}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-body">{section.content}</div>
          </div>
        );
      
      case 'gallery':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-grid">
              {Array.from({ length: section.items || 3 }).map((_, i) => (
                <div key={i} className="p-img"></div>
              ))}
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-body">
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                Contact Form
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="p-section">Unknown section type</div>;
    }
  };

  // Render editable section with toolbar
  const renderEditableSection = (section, index) => {
    return (
      <div key={index} className="sec-group">
        <div 
          className={`e-sec ${selectedSection === index ? 'sel' : ''}`}
          onClick={() => setSelectedSection(index)}
        >
          <div className="sec-bar">
            <button className="sb-btn">↑</button>
            <button className="sb-btn">↓</button>
            <div className="sb-div"></div>
            <button className="sb-btn">Change design</button>
            <div className="sb-div"></div>
            <button className="sb-btn" style={{ color: '#f87171' }}>Delete</button>
          </div>
          {renderSectionContent(section)}
        </div>
        <button 
          className="add-sec" 
          onClick={() => setSearchParams({ inserter: 'true' })}
        >
          + Add section
        </button>
      </div>
    );
  };

  // Render template placeholder
  const renderTemplatePlaceholder = (content) => {
    const section = content.sections[0];
    
    return (
      <div className="sec-group">
        <div className="e-sec template-placeholder">
          <div className="template-notice">
            <div className="template-notice-icon">📄</div>
            <div className="template-notice-content">
              <h3 className="template-notice-title">{section.templateName}</h3>
              <p className="template-notice-description">{section.description}</p>
              <div className="template-notice-type">
                Template Type: {section.templateType}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

            {/* Dynamic sections based on current page */}
            {content.isTemplate ? (
              renderTemplatePlaceholder(content)
            ) : (
              content.sections.map((section, index) => renderEditableSection(section, index))
            )}

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
