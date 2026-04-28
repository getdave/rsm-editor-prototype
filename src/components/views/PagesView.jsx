import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { pages } from '../../data/mockData';
import { home, page as pageIcon } from '@wordpress/icons';

function PagesView() {
  const [activeTab, setActiveTab] = useState('all');
  const { setCurrentView } = useAppState();

  const contentPages = pages.filter(p => !p.isSystem);
  const systemPages = pages.filter(p => p.isSystem);

  const filterPages = (pagesList) => {
    if (activeTab === 'live') return pagesList.filter(p => p.isLive);
    if (activeTab === 'draft') return pagesList.filter(p => !p.isLive);
    return pagesList;
  };

  const filteredContentPages = filterPages(contentPages);
  const filteredSystemPages = filterPages(systemPages);

  const handleEdit = (pageItem) => {
    if (pageItem.id === 'home') {
      setCurrentView('editing');
    }
  };

  return (
    <div className="pages-panel show">
      <div className="pp-inner">
        <div className="pp-hd">
          <span className="pp-title">Pages</span>
          <button className="pp-add">+ Add page</button>
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
        
        {filteredContentPages.map((pageItem) => (
          <div key={pageItem.id} className="pp-row">
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
              <button className="pp-act" onClick={() => handleEdit(pageItem)}>
                Edit
              </button>
              <button className="pp-act">Settings</button>
            </div>
          </div>
        ))}
        
        {filteredSystemPages.length > 0 && (
          <>
            <div className="pp-sys-label">System pages</div>
            {filteredSystemPages.map((pageItem) => (
              <div key={pageItem.id} className="pp-row">
                <span className="pp-ico" style={{ opacity: 0.45 }}>
                  {pageIcon}
                </span>
                <span className="pp-name" style={{ color: '#aaa' }}>
                  {pageItem.name}
                </span>
                <div className="pp-meta">
                  {pageItem.badge === 'WooCommerce' && (
                    <span className="pp-badge" style={{ background: 'rgba(127,84,179,.12)', color: '#7f54b3' }}>
                      WooCommerce
                    </span>
                  )}
                </div>
                <div className="pp-actions">
                  <button className="pp-act">Edit</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default PagesView;
