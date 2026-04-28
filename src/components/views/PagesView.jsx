import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { pages } from '../../data/mockData';

const icons = {
  home: 'M12 4L4 7.9V20h16V7.9L12 4zm6.5 14.5H14V13h-4v5.5H5.5V8.8L12 5.7l6.5 3.1v9.7z',
  page: 'M15.5 7.5h-7V9h7V7.5Zm-7 3.5h7v1.5h-7V11Zm7 3.5h-7V16h7v-1.5ZM17 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM7 5.5h10a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z'
};

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
            <span className="pp-ico">
              <svg 
                viewBox="0 0 24 24"
                style={{ 
                  width: 16, 
                  height: 16, 
                  fill: pageItem.id === 'home' ? '#3858e9' : '#999'
                }} 
              >
                <path d={pageItem.id === 'home' ? icons.home : icons.page} />
              </svg>
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
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
                    <path d={icons.page} />
                  </svg>
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
