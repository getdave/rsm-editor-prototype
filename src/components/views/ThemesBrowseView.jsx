import { useState } from 'react';
import { Button, SearchControl, TabPanel } from '@wordpress/components';
import { upload, settings as settingsIcon } from '@wordpress/icons';
import { availableThemes } from '../../data/mockData';

const TABS = [
  { name: 'featured', title: 'Featured' },
  { name: 'popular', title: 'Popular' },
  { name: 'latest', title: 'Latest' },
  { name: 'block', title: 'Block Themes' },
  { name: 'favorites', title: 'Favorites' },
];

function ThemesBrowseView() {
  const [search, setSearch] = useState('');

  const renderGrid = (tabName) => {
    const filtered = availableThemes
      .filter((t) => t.tags.includes(tabName))
      .filter(
        (t) => !search || t.name.toLowerCase().includes(search.toLowerCase()),
      );

    if (filtered.length === 0) {
      return <div className="themes-empty">No themes match your search.</div>;
    }

    return (
      <div className="themes-grid">
        {filtered.map((t) => (
          <div key={t.id} className="pp-card theme-card">
            <div
              className="theme-card-thumb"
              style={{ backgroundImage: t.screenshot }}
              role="img"
              aria-label={`${t.name} screenshot`}
            />
            <div className="pp-card-body">
              <div className="pp-card-name">{t.name}</div>
              <div className="theme-card-meta">
                By {t.author} · ★ {t.rating}
              </div>
              <div className="theme-card-actions">
                <Button variant="primary">Install</Button>
                <Button variant="secondary">Preview</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="preview-body">
      <div className="preview-body-canvas themes-view themes-browse">
        <div className="themes-browse-toolbar">
          <SearchControl
            __nextHasNoMarginBottom
            value={search}
            onChange={setSearch}
            placeholder="Search themes…"
          />
          <div className="themes-browse-actions">
            <Button variant="tertiary" icon={settingsIcon}>
              Filter
            </Button>
            <Button variant="secondary" icon={upload}>
              Upload Theme
            </Button>
          </div>
        </div>
        <TabPanel
          className="themes-browse-tabs"
          tabs={TABS}
          initialTabName="featured"
        >
          {(tab) => renderGrid(tab.name)}
        </TabPanel>
      </div>
    </div>
  );
}

export default ThemesBrowseView;
