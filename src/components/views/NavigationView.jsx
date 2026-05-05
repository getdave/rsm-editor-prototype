import { useState } from 'react';
import { navigationMenus } from '../../data/mockData';
import MenuList from '../navigation/MenuList';
import MenuEditor from '../navigation/MenuEditor';
import MenuPreviews from '../navigation/MenuPreviews';

function NavigationView() {
  const [selectedMenuId, setSelectedMenuId] = useState('main-menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');

  const selectedMenu = navigationMenus.find(menu => menu.id === selectedMenuId);

  const filteredMenus = navigationMenus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return b.usedIn.length - a.usedIn.length;
  });

  return (
    <div className="nav-view">
      <MenuList
        menus={sortedMenus}
        selectedMenuId={selectedMenuId}
        onSelectMenu={setSelectedMenuId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {selectedMenu && (
        <>
          <MenuEditor
            menu={selectedMenu}
            onBack={() => setSelectedMenuId(null)}
          />
          <MenuPreviews menu={selectedMenu} />
        </>
      )}
    </div>
  );
}

export default NavigationView;
