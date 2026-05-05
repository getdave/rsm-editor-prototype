import { useState } from 'react';
import { Button } from '@wordpress/components';
import { arrowLeft, chevronDown, chevronRight, chevronUp, chevronDown as arrowDown, page as pageIcon, close } from '@wordpress/icons';
import { pages } from '../../data/mockData';
import PagePicker from './PagePicker';

function MenuEditor({ menu, onUpdateMenu, onBack }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showPagePicker, setShowPagePicker] = useState(false);

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddItems = (pageIds) => {
    const newItems = pageIds.map((pageId, index) => {
      const page = pages.find((p) => p.id === pageId);
      return {
        id: `nav-${Date.now()}-${index}`,
        pageId,
        label: page?.name || 'Untitled',
        children: [],
      };
    });

    onUpdateMenu({ items: [...menu.items, ...newItems] });
  };

  const removeItem = (itemId) => {
    const removeFromItems = (items) => {
      return items.filter((item) => {
        if (item.id === itemId) return false;
        if (item.children && item.children.length > 0) {
          item.children = removeFromItems(item.children);
        }
        return true;
      });
    };

    onUpdateMenu({ items: removeFromItems([...menu.items]) });
  };

  const moveItem = (itemId, direction) => {
    const findAndMove = (items) => {
      const index = items.findIndex((item) => item.id === itemId);
      if (index === -1) {
        return items.map((item) => ({
          ...item,
          children: item.children ? findAndMove(item.children) : [],
        }));
      }

      const newItems = [...items];
      if (direction === 'up' && index > 0) {
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      }

      return newItems;
    };

    onUpdateMenu({ items: findAndMove([...menu.items]) });
  };

  const renderMenuItem = (item, level = 0, siblings = [], index = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const page = pages.find((p) => p.id === item.pageId);
    const canMoveUp = index > 0;
    const canMoveDown = index < siblings.length - 1;

    return (
      <div key={item.id} className="nav-menu-item-wrapper">
        <div
          className="nav-menu-editor-item"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren && (
            <button
              className="nav-item-toggle"
              onClick={() => toggleExpanded(item.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? chevronDown : chevronRight}
            </button>
          )}
          {!hasChildren && <span className="nav-item-spacer" />}
          
          <span className="nav-item-icon">{pageIcon}</span>
          <span className="nav-item-label">{item.label}</span>

          <div className="nav-item-actions">
            <button
              className="nav-item-move"
              onClick={() => moveItem(item.id, 'up')}
              disabled={!canMoveUp}
              aria-label="Move up"
              title="Move up"
            >
              {chevronUp}
            </button>
            <button
              className="nav-item-move"
              onClick={() => moveItem(item.id, 'down')}
              disabled={!canMoveDown}
              aria-label="Move down"
              title="Move down"
            >
              {arrowDown}
            </button>
            <button
              className="nav-item-remove"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.label}`}
              title="Remove"
            >
              {close}
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="nav-menu-children">
            {item.children.map((child, childIndex) =>
              renderMenuItem(child, level + 1, item.children, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="nav-panel nav-menu-editor">
      <div className="nav-panel-header">
        <Button
          icon={arrowLeft}
          label="Back to menu list"
          onClick={onBack}
          className="nav-back-btn"
        />
        <h2 className="nav-panel-title">{menu.name}</h2>
        <Button
          variant="secondary"
          onClick={() => setShowPagePicker(true)}
          className="nav-header-add-btn"
        >
          Add Pages
        </Button>
      </div>

      <div className="nav-menu-editor-items">
        {menu.items.length === 0 ? (
          <div className="nav-empty-state">
            <p>No items in this menu yet</p>
            <p className="nav-empty-hint">Click "Add item" below to get started</p>
          </div>
        ) : (
          menu.items.map((item, index) => renderMenuItem(item, 0, menu.items, index))
        )}
      </div>

      {showPagePicker && (
        <PagePicker
          menu={menu}
          onAddItems={handleAddItems}
          onClose={() => setShowPagePicker(false)}
        />
      )}
    </div>
  );
}

export default MenuEditor;
