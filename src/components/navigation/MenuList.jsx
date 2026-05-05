import { Button, SearchControl } from '@wordpress/components';
import { plus, search } from '@wordpress/icons';

function MenuList({
  menus,
  selectedMenuId,
  onSelectMenu,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  const getLocationText = (count) => {
    if (count === 0) return '0 locations';
    if (count === 1) return '1 location';
    return `${count} locations`;
  };

  return (
    <div className="nav-panel nav-menu-list">
      <div className="nav-panel-header">
        <h2 className="nav-panel-title">Navigation</h2>
        <Button
          icon={plus}
          label="Add menu"
          onClick={() => {}}
          className="nav-add-menu-btn"
        />
      </div>

      <div className="nav-menu-controls">
        <SearchControl
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search menus"
          className="nav-search"
        />
        <div className="nav-sort-toggle">
          <button
            className={sortBy === 'alphabetical' ? 'active' : ''}
            onClick={() => onSortChange('alphabetical')}
          >
            A-Z
          </button>
          <button
            className={sortBy === 'locations' ? 'active' : ''}
            onClick={() => onSortChange('locations')}
          >
            Locations
          </button>
        </div>
      </div>

      <div className="nav-menu-items">
        {menus.map((menu) => (
          <button
            key={menu.id}
            className={`nav-menu-item ${menu.id === selectedMenuId ? 'selected' : ''} ${
              menu.usedIn.length === 0 ? 'unused' : ''
            }`}
            onClick={() => onSelectMenu(menu.id)}
          >
            <div className="nav-menu-item-main">
              <span className="nav-menu-item-name">
                {menu.name}
                {menu.isPrimary && (
                  <span className="nav-menu-badge">Primary</span>
                )}
              </span>
              <span className="nav-menu-item-count">
                {getLocationText(menu.usedIn.length)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="nav-empty-state">
          <p>No menus found</p>
        </div>
      )}
    </div>
  );
}

export default MenuList;
