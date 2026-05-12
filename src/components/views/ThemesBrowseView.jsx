import { useState } from 'react';
import { Button, SearchControl, TabPanel } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
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
      return (
        <Text variant="body-md" className="themes-empty">
          No themes match your search.
        </Text>
      );
    }

    return (
      <div className="themes-grid">
        {filtered.map((t) => (
          <Card.Root key={t.id} className="pp-card theme-card">
            <div
              className="theme-card-thumb"
              style={{ backgroundImage: t.screenshot }}
              role="img"
              aria-label={`${t.name} screenshot`}
            />
            <Card.Content className="pp-card-body">
              <Stack direction="column" gap="xs">
                <Text variant="body-md" className="pp-card-name">{t.name}</Text>
                <Text variant="body-sm" className="theme-card-meta">
                  By {t.author} · ★ {t.rating}
                </Text>
                <Stack direction="row" wrap gap="sm" className="theme-card-actions">
                  <Button variant="primary">Install</Button>
                  <Button variant="secondary">Preview</Button>
                </Stack>
              </Stack>
            </Card.Content>
          </Card.Root>
        ))}
      </div>
    );
  };

  return (
    <div className="preview-body">
      <div className="preview-body-canvas themes-view themes-browse">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          wrap
          gap="md"
          className="themes-browse-toolbar"
        >
          <SearchControl
            __nextHasNoMarginBottom
            value={search}
            onChange={setSearch}
            placeholder="Search themes…"
          />
          <Stack direction="row" gap="sm" className="themes-browse-actions">
            <Button variant="tertiary" icon={settingsIcon}>
              Filter
            </Button>
            <Button variant="secondary" icon={upload}>
              Upload Theme
            </Button>
          </Stack>
        </Stack>
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
