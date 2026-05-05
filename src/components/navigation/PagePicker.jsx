import { useState, useMemo } from 'react';
import { Button, SearchControl, CheckboxControl } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { pages } from '../../data/mockData';

function PagePicker({ menu, onAddItems, onClose }) {
  const [selectedPageIds, setSelectedPageIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const existingPageIds = useMemo(() => {
    const ids = new Set();
    const collectPageIds = (items) => {
      items.forEach((item) => {
        ids.add(item.pageId);
        if (item.children && item.children.length > 0) {
          collectPageIds(item.children);
        }
      });
    };
    collectPageIds(menu.items);
    return ids;
  }, [menu.items]);

  const contentPages = pages.filter(
    (page) => page.category === 'content' && !page.isSystem
  );

  const filteredPages = contentPages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePage = (pageId) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleAdd = () => {
    if (selectedPageIds.length > 0) {
      onAddItems(selectedPageIds);
      onClose();
    }
  };

  return (
    <div className="nav-page-picker">
      <div className="nav-page-picker-header">
        <h3 className="nav-page-picker-title">Add pages to menu</h3>
        <Button
          icon={close}
          label="Close"
          onClick={onClose}
          className="nav-page-picker-close"
        />
      </div>

      <div className="nav-page-picker-search">
        <SearchControl
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search pages"
        />
      </div>

      <div className="nav-page-picker-items">
        {filteredPages.length === 0 ? (
          <div className="nav-page-picker-empty">
            <p>No pages found</p>
          </div>
        ) : (
          filteredPages.map((page) => {
            const isInMenu = existingPageIds.has(page.id);
            const isSelected = selectedPageIds.includes(page.id);

            return (
              <label
                key={page.id}
                className={`nav-page-picker-item ${isInMenu ? 'in-menu' : ''}`}
              >
                <CheckboxControl
                  checked={isSelected}
                  onChange={() => togglePage(page.id)}
                  disabled={isInMenu}
                />
                <span className="nav-page-picker-item-name">{page.name}</span>
                {isInMenu && (
                  <span className="nav-page-picker-badge">In menu</span>
                )}
              </label>
            );
          })
        )}
      </div>

      <div className="nav-page-picker-footer">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={selectedPageIds.length === 0}
        >
          Add {selectedPageIds.length > 0 ? `(${selectedPageIds.length})` : ''}
        </Button>
      </div>
    </div>
  );
}

export default PagePicker;
