import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from '@wordpress/components';
import { useAppState } from '../../hooks/useAppState';
import { pages } from '../../data/mockData';
import { home, page as pageIcon, list, grid, chevronDown, chevronUp, plus } from '@wordpress/icons';
import SplitViewLayout from '../../layouts/SplitViewLayout';
import PreviewCanvas from '../shared/PreviewCanvas';

function PagesView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pagesViewMode, setPagesViewMode } = useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [activeTab, setActiveTab] = useState('all');
  const [systemPagesOpen, setSystemPagesOpen] = useState(true);
  const [dynamicPagesOpen, setDynamicPagesOpen] = useState(true);
  
  // Use global view mode state
  const viewMode = pagesViewMode;

  const contentPages = pages.filter(p => !p.isSystem);
  const systemPages = pages.filter(p => p.isSystem && !p.isDynamic);
  const dynamicPages = pages.filter(p => p.isDynamic);

  const filterPages = (pagesList) => {
    if (activeTab === 'live') return pagesList.filter(p => p.isLive);
    if (activeTab === 'draft') return pagesList.filter(p => !p.isLive);
    return pagesList;
  };

  const filteredContentPages = filterPages(contentPages);
  const filteredSystemPages = filterPages(systemPages);
  const filteredDynamicPages = filterPages(dynamicPages);

  const handleEdit = (pageItem) => {
    setCurrentPage(pageItem); // Update global state
    navigate(`/pages/${pageItem.id}/edit`);
  };

  const setViewMode = (mode) => {
    setPagesViewMode(mode);
  };

  const renderBadges = (badges) => {
    if (!badges || badges.length === 0) return null;
    
    const badgeStyles = {
      'WordPress': { background: 'rgba(33,117,155,.12)', color: '#21759b' },
      'Template': { background: 'rgba(245,158,11,.12)', color: '#d97706' },
      'Theme': { background: 'rgba(139,92,246,.12)', color: '#7c3aed' },
      'Plugin': { background: 'rgba(34,197,94,.12)', color: '#16a34a' },
      'WooCommerce': { background: 'rgba(127,84,179,.12)', color: '#7f54b3' }
    };
    
    return badges.map((badge) => (
      <span key={badge} className="pp-badge" style={badgeStyles[badge] || {}}>
        {badge}
      </span>
    ));
  };

  const stageContent = (
    <div className="pp-inner">
        <div className="pp-hd">
          <span className="pp-title">Pages</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ButtonGroup>
              <Button 
                className={viewMode === 'list' ? 'is-pressed' : ''}
                onClick={() => setViewMode('list')}
                icon={list}
                label="List view"
                iconSize={20}
              />
              <Button 
                className={viewMode === 'grid' ? 'is-pressed' : ''}
                onClick={() => setViewMode('grid')}
                icon={grid}
                label="Grid view"
                iconSize={20}
              />
            </ButtonGroup>
            <button className="pp-add">+ Add page</button>
          </div>
        </div>
        <div className="pp-tabs">
          <div 
            className={`pp-tab ${activeTab === 'all' ? 'on' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </div>
          <div 
            className={`pp-tab ${activeTab === 'live' ? 'on' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live
          </div>
          <div 
            className={`pp-tab ${activeTab === 'draft' ? 'on' : ''}`}
            onClick={() => setActiveTab('draft')}
          >
            Draft
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <>
            {filteredContentPages.map((pageItem) => (
              <div 
                key={pageItem.id} 
                className="pp-row"
                onClick={() => setPreviewPage(pageItem)}
                style={{ cursor: 'pointer' }}
              >
            <span className="pp-ico" style={{ color: pageItem.id === 'home' ? '#3858e9' : '#999' }}>
              {pageItem.id === 'home' ? home : pageIcon}
            </span>
            <span 
              className="pp-name" 
              style={{ color: pageItem.id === 'home' ? '#3858e9' : '#1e1e1e' }}
            >
              {pageItem.name}
            </span>
            <div className="pp-meta">
              {pageItem.inMenu && <span className="pp-badge pp-nav">In menu</span>}
              {!pageItem.isLive && <span className="pp-badge pp-draft">Draft</span>}
            </div>
            <div className="pp-actions">
              <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>
                Edit
              </button>
            </div>
          </div>
            ))}
            
            {filteredSystemPages.length > 0 && (
          <>
            <div 
              className="pp-accordion-header" 
              onClick={() => setSystemPagesOpen(!systemPagesOpen)}
            >
              <span className="pp-accordion-icon">
                {systemPagesOpen ? chevronUp : chevronDown}
              </span>
              <span className="pp-accordion-title">System pages</span>
            </div>
            {systemPagesOpen && (
              <>
                <div className="pp-accordion-desc">
                  System pages are pages auto-generated by your Theme, Plugins or WordPress itself.
                </div>
                {filteredSystemPages.map((pageItem) => (
              <div 
                key={pageItem.id} 
                className="pp-row"
                onClick={() => setPreviewPage(pageItem)}
                style={{ cursor: 'pointer' }}
              >
                <span className="pp-ico">
                  {pageIcon}
                </span>
                <span className="pp-name">
                  {pageItem.name}
                </span>
                <div className="pp-meta">
                  {renderBadges(pageItem.badges)}
                </div>
                <div className="pp-actions">
                  <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>Edit</button>
                </div>
              </div>
                ))}
              </>
            )}
          </>
            )}
            
            {filteredDynamicPages.length > 0 && (
          <>
            <div 
              className="pp-accordion-header" 
              onClick={() => setDynamicPagesOpen(!dynamicPagesOpen)}
            >
              <span className="pp-accordion-icon">
                {dynamicPagesOpen ? chevronUp : chevronDown}
              </span>
              <span className="pp-accordion-title">Dynamic pages</span>
            </div>
            {dynamicPagesOpen && (
              <>
                <div className="pp-accordion-desc">
                  Dynamic pages are templates that generate content automatically based on your site's data.
                </div>
                {filteredDynamicPages.map((pageItem) => (
              <div 
                key={pageItem.id} 
                className="pp-row"
                onClick={() => setPreviewPage(pageItem)}
                style={{ cursor: 'pointer' }}
              >
                <span className="pp-ico">
                  {pageIcon}
                </span>
                <span className="pp-name">
                  {pageItem.name}
                </span>
                <div className="pp-meta">
                  {renderBadges(pageItem.badges)}
                </div>
                <div className="pp-actions">
                  <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>Edit</button>
                </div>
              </div>
                ))}
              </>
            )}
          </>
            )}
          </>
        ) : (
          <>
            <div className="pp-grid">
              <div className="pp-card pp-card-add">
                <div className="pp-card-thumb">
                  <span className="pp-card-icon pp-card-icon-add">
                    {plus}
                  </span>
                </div>
                <div className="pp-card-body">
                  <div className="pp-card-name">Add new</div>
                </div>
              </div>
              {filteredContentPages.map((pageItem) => (
                <div 
                  key={pageItem.id} 
                  className="pp-card"
                  onClick={() => setPreviewPage(pageItem)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pp-card-thumb">
                    <span className="pp-card-icon">
                      {pageItem.id === 'home' ? home : pageIcon}
                    </span>
                  </div>
                  <div className="pp-card-body">
                    <div className="pp-card-name">{pageItem.name}</div>
                    <div className="pp-card-meta">
                      {pageItem.inMenu && <span className="pp-badge pp-nav">In menu</span>}
                      {!pageItem.isLive && <span className="pp-badge pp-draft">Draft</span>}
                    </div>
                  </div>
                  <div className="pp-card-actions">
                    <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredSystemPages.length > 0 && (
              <>
                <div 
                  className="pp-accordion-header" 
                  onClick={() => setSystemPagesOpen(!systemPagesOpen)}
                >
                  <span className="pp-accordion-icon">
                    {systemPagesOpen ? chevronUp : chevronDown}
                  </span>
                  <span className="pp-accordion-title">System pages</span>
                </div>
                {systemPagesOpen && (
                <>
                  <div className="pp-accordion-desc">
                    System pages are pages auto-generated by your Theme, Plugins or WordPress itself.
                  </div>
                  <div className="pp-grid">
                  {filteredSystemPages.map((pageItem) => (
                    <div 
                      key={pageItem.id} 
                      className="pp-card"
                      onClick={() => setPreviewPage(pageItem)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="pp-card-thumb">
                        <span className="pp-card-icon">
                          {pageIcon}
                        </span>
                      </div>
                      <div className="pp-card-body">
                        <div className="pp-card-name">{pageItem.name}</div>
                        <div className="pp-card-meta">
                          {renderBadges(pageItem.badges)}
                        </div>
                      </div>
                      <div className="pp-card-actions">
                        <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>Edit</button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
                )}
              </>
            )}
            
            {filteredDynamicPages.length > 0 && (
              <>
                <div 
                  className="pp-accordion-header" 
                  onClick={() => setDynamicPagesOpen(!dynamicPagesOpen)}
                >
                  <span className="pp-accordion-icon">
                    {dynamicPagesOpen ? chevronUp : chevronDown}
                  </span>
                  <span className="pp-accordion-title">Dynamic pages</span>
                </div>
                {dynamicPagesOpen && (
                <>
                  <div className="pp-accordion-desc">
                    Dynamic pages are templates that generate content automatically based on your site's data.
                  </div>
                  <div className="pp-grid">
                  {filteredDynamicPages.map((pageItem) => (
                    <div 
                      key={pageItem.id} 
                      className="pp-card"
                      onClick={() => setPreviewPage(pageItem)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="pp-card-thumb">
                        <span className="pp-card-icon">
                          {pageIcon}
                        </span>
                      </div>
                      <div className="pp-card-body">
                        <div className="pp-card-name">{pageItem.name}</div>
                        <div className="pp-card-meta">
                          {renderBadges(pageItem.badges)}
                        </div>
                      </div>
                      <div className="pp-card-actions">
                        <button className="pp-act" onClick={(e) => { e.stopPropagation(); handleEdit(pageItem); }}>Edit</button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
                )}
              </>
            )}
          </>
        )}
      </div>
  );

  const canvasContent = (
    <PreviewCanvas 
      page={previewPage} 
      onEdit={() => handleEdit(previewPage)} 
    />
  );

  const gridContent = stageContent;

  return (
    <div className="pages-panel show">
      <SplitViewLayout
        mode={viewMode}
        stageContent={stageContent}
        canvasContent={canvasContent}
        gridContent={gridContent}
      />
    </div>
  );
}

export default PagesView;
