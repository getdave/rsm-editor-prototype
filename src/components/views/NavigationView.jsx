import { useState } from 'react';
import { navigationMenus as initialMenus } from '../../data/mockData';
import MenuList from '../navigation/MenuList';
import MenuEditor from '../navigation/MenuEditor';
import MenuPreviews from '../navigation/MenuPreviews';
import AddMenuModal from '../navigation/AddMenuModal';

function NavigationView() {
  const [menus, setMenus] = useState(initialMenus);
  const [selectedMenuId, setSelectedMenuId] = useState('main-menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  const selectedMenu = menus.find(menu => menu.id === selectedMenuId);

  const updateMenu = (menuId, updates) => {
    setMenus(prev => prev.map(menu =>
      menu.id === menuId ? { ...menu, ...updates } : menu
    ));
  };

  const addMenu = (menuName) => {
    const newMenu = {
      id: `menu-${Date.now()}`,
      name: menuName,
      isPrimary: false,
      items: [],
      usedIn: [],
    };
    setMenus(prev => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
  };

  const filteredMenus = menus.filter(menu =>
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
        onAddMenu={() => setShowAddMenuModal(true)}
      />
      {selectedMenu && (
        <>
          <MenuEditor
            menu={selectedMenu}
            onUpdateMenu={(updates) => updateMenu(selectedMenuId, updates)}
            onBack={() => setSelectedMenuId(null)}
          />
          <MenuPreviews menu={selectedMenu} />
        </>
      )}
      <AddMenuModal
        isOpen={showAddMenuModal}
        onClose={() => setShowAddMenuModal(false)}
        onAddMenu={addMenu}
      />
    </div>
  );
}

export default NavigationView;
