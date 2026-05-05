import { useState } from 'react';
import { Button } from '@wordpress/components';
import { arrowLeft, chevronDown, chevronRight, page as pageIcon, close } from '@wordpress/icons';
import { pages } from '../../data/mockData';

function MenuEditor({ menu, onBack }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

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

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const page = pages.find((p) => p.id === item.pageId);

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
          
          <button
            className="nav-item-remove"
            onClick={() => {}}
            aria-label={`Remove ${item.label}`}
          >
            {close}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="nav-menu-children">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
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
      </div>

      <div className="nav-menu-editor-items">
        {menu.items.length === 0 ? (
          <div className="nav-empty-state">
            <p>No items in this menu yet</p>
            <p className="nav-empty-hint">Click "Add item" below to get started</p>
          </div>
        ) : (
          menu.items.map((item) => renderMenuItem(item))
        )}
      </div>

      <div className="nav-menu-editor-footer">
        <Button
          variant="secondary"
          onClick={() => {}}
          className="nav-add-item-btn"
        >
          Add item
        </Button>
      </div>
    </div>
  );
}

export default MenuEditor;
