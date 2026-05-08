import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sections } from '../../data/mockData';

/**
 * Section inserter body only (no outer shell). Wrapped by EditorLeftPanel.
 */
export function SectionInserterContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Tell my story', 'Show my work', 'Reviews', 'Contact', 'Posts'];

  const filteredSections = sections.filter((section) => {
    const matchesCategory = activeCategory === 'All' || section.categories.includes(activeCategory);
    const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSectionClick = () => {
    searchParams.delete('inserter');
    setSearchParams(searchParams);
  };

  const closeInserter = () => {
    searchParams.delete('inserter');
    setSearchParams(searchParams);
  };

  return (
    <>
      <div className="ins-hd">
        <span className="ins-title">Add a section</span>
        <button type="button" className="ins-close" onClick={closeInserter}>
          ✕
        </button>
      </div>

      <div className="ins-search-wrap">
        <input
          className="ins-search"
          placeholder="Search sections…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ins-cats">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`c-btn ${activeCategory === cat ? 'on' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="ins-list">
        <div className="ins-grid">
          {filteredSections.map((section) => (
            <div key={section.id} className="s-opt" onClick={handleSectionClick}>
              <div className="s-prev">
                {section.id === 'hero' && (
                  <>
                    <div className="ln img"></div>
                    <div className="ln s"></div>
                    <div className="ln m"></div>
                  </>
                )}
                {section.id === 'text-intro' && (
                  <>
                    <div className="ln s"></div>
                    <div className="ln f"></div>
                    <div className="ln m"></div>
                  </>
                )}
                {section.id === 'photo-gallery' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px' }}>
                    <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
                    <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
                    <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
                  </div>
                )}
                {section.id !== 'hero' && section.id !== 'text-intro' && section.id !== 'photo-gallery' && (
                  <>
                    <div className="ln s"></div>
                    <div className="ln f"></div>
                  </>
                )}
              </div>
              <div className="s-lbl">{section.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SectionInserterContent;
