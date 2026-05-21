import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, SearchControl, TabPanel } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import * as wpIcons from '@wordpress/icons';

const { Icon: WPIcon } = wpIcons;
import {
  inserterBlocks,
  inserterBlockCategories,
  inserterPatterns,
} from '../../data/mockData';
import TT5PatternPreview from '../shared/TT5PatternPreview';

const TABS = [
  { name: 'blocks', title: 'Blocks' },
  { name: 'patterns', title: 'Patterns' },
  { name: 'media', title: 'Media' },
];

const DEFAULT_TAB = 'blocks';
const VALID_TAB_NAMES = TABS.map((t) => t.name);

function getIcon(iconKey) {
  return wpIcons[iconKey] ?? wpIcons.blockDefault;
}

function PatternPreview({ kind }) {
  if (kind === 'hero') {
    return (
      <>
        <div className="ln img"></div>
        <div className="ln s"></div>
        <div className="ln m"></div>
      </>
    );
  }
  if (kind === 'twoCol') {
    return (
      <div className="pattern-preview-two-col">
        <div className="ln img"></div>
        <Stack direction="column" gap="xs">
          <div className="ln s"></div>
          <div className="ln f"></div>
          <div className="ln m"></div>
        </Stack>
      </div>
    );
  }
  if (kind === 'gallery') {
    return (
      <div className="pattern-preview-gallery">
        <div className="pattern-preview-gallery-cell"></div>
        <div className="pattern-preview-gallery-cell"></div>
        <div className="pattern-preview-gallery-cell"></div>
      </div>
    );
  }
  if (kind === 'cta') {
    return (
      <>
        <div className="ln s"></div>
        <div className="ln f"></div>
        <div className="ln m"></div>
      </>
    );
  }
  if (kind === 'features') {
    return (
      <>
        <div className="ln s"></div>
        <div className="ln f"></div>
        <div className="ln f"></div>
      </>
    );
  }
  return (
    <>
      <div className="ln s"></div>
      <div className="ln f"></div>
    </>
  );
}

function BlockCard({ block, onInsert }) {
  const icon = getIcon(block.iconKey);
  return (
    <button type="button" className="bi-block" onClick={onInsert}>
      <span className="bi-block-icon" aria-hidden>
        <WPIcon icon={icon} size={24} />
      </span>
      <Text variant="body-sm" className="bi-block-label">{block.name}</Text>
    </button>
  );
}

function PatternCard({ pattern, onInsert }) {
  return (
    <button type="button" className="bi-pattern" onClick={() => onInsert(pattern)}>
      <div className={`bi-pattern-preview${pattern.isTT5Pattern ? ' bi-pattern-preview--tt5' : ''}`}>
        {pattern.isTT5Pattern ? (
          <TT5PatternPreview pattern={pattern} />
        ) : (
          <PatternPreview kind={pattern.previewKind} />
        )}
      </div>
      <Text variant="body-sm" className="bi-pattern-label">{pattern.name}</Text>
    </button>
  );
}

function BlocksTab({ onInsert }) {
  return (
    <Stack direction="column" gap="lg" className="bi-blocks">
      {inserterBlockCategories.map((cat) => {
        const blocksInCat = inserterBlocks.filter((b) => b.category === cat.id);
        if (blocksInCat.length === 0) return null;
        return (
          <section key={cat.id} className="bi-category">
            <Text as="h3" variant="heading-sm" className="bi-category-heading">
              {cat.label}
            </Text>
            <div className="bi-grid">
              {blocksInCat.map((b) => (
                <BlockCard key={b.id} block={b} onInsert={onInsert} />
              ))}
            </div>
          </section>
        );
      })}
    </Stack>
  );
}

function PatternsTab({ onInsert }) {
  return (
    <Stack direction="column" gap="lg" className="ins-pattern-list">
      {inserterPatterns.map((p) => (
        <PatternCard key={p.id} pattern={p} onInsert={onInsert} />
      ))}
    </Stack>
  );
}

function MediaTab() {
  return (
    <Text variant="body-sm" className="bi-empty-note">
      Pending
    </Text>
  );
}

function SearchResults({ searchTerm, blockMatches, patternMatches, onInsert }) {
  const hasAnyMatch = blockMatches.length + patternMatches.length > 0;
  return (
    <Stack direction="column" gap="lg" className="bi-blocks">
      {!hasAnyMatch && (
        <Text variant="body-sm" className="bi-empty-note">
          No results for &ldquo;{searchTerm.trim()}&rdquo;
        </Text>
      )}
      {blockMatches.length > 0 && (
        <section className="bi-category">
          <Text as="h3" variant="heading-sm" className="bi-category-heading">Blocks</Text>
          <div className="bi-grid">
            {blockMatches.map((b) => (
              <BlockCard key={b.id} block={b} onInsert={onInsert} />
            ))}
          </div>
        </section>
      )}
      {patternMatches.length > 0 && (
        <section className="bi-category">
          <Text as="h3" variant="heading-sm" className="bi-category-heading">Patterns</Text>
          <Stack direction="column" gap="lg" className="ins-pattern-list">
            {patternMatches.map((p) => (
              <PatternCard key={p.id} pattern={p} onInsert={onInsert} />
            ))}
          </Stack>
        </section>
      )}
    </Stack>
  );
}

/**
 * Block inserter sidebar (Blocks / Patterns / Media), built on
 * WordPress design-system primitives: SearchControl, TabPanel, Button,
 * Stack / Text. Mirrors Gutenberg's inserter chrome.
 *
 * The active tab on first render comes from the `?inserter=<tab>` URL
 * param when it names a valid tab, so callers can deep-link to a tab
 * (e.g. `?inserter=patterns` from the Pages "Edit" action).
 */
export function BlockInserterContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TAB_NAMES.includes(searchParams.get('inserter'))
    ? searchParams.get('inserter')
    : DEFAULT_TAB;
  const [searchTerm, setSearchTerm] = useState('');

  const closeInserter = () => {
    searchParams.delete('inserter');
    setSearchParams(searchParams);
  };

  const handleInsert = (item) => {
    if (item) {
      window.alert("Insertion of sections isn't implemented in this prototype.");
    }
  };

  const trimmedSearch = searchTerm.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;
  const nameMatches = (name) => name.toLowerCase().includes(trimmedSearch);
  const blockMatches = isSearching
    ? inserterBlocks.filter((b) => nameMatches(b.name))
    : [];
  const patternMatches = isSearching
    ? inserterPatterns.filter((p) => nameMatches(p.name))
    : [];

  return (
    <div className="list-view-inner bi-root" role="region" aria-label="Block inserter">
      <Stack direction="row" align="center" gap="sm" className="bi-search-row">
        <SearchControl
          __nextHasNoMarginBottom
          className="bi-search"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search"
          label="Search blocks, patterns, and media"
          hideLabelFromVision
        />
        <Button
          className="bi-close"
          label="Close block inserter"
          icon={wpIcons.closeSmall}
          onClick={closeInserter}
        />
      </Stack>

      {isSearching ? (
        <div className="bi-list">
          <SearchResults
            searchTerm={searchTerm}
            blockMatches={blockMatches}
            patternMatches={patternMatches}
            onInsert={handleInsert}
          />
        </div>
      ) : (
        <TabPanel
          className="bi-tabs"
          tabs={TABS}
          initialTabName={initialTab}
        >
          {(activeTab) => (
            <>
              <div className="bi-list">
                {activeTab.name === 'blocks' && <BlocksTab onInsert={handleInsert} />}
                {activeTab.name === 'patterns' && <PatternsTab onInsert={handleInsert} />}
                {activeTab.name === 'media' && <MediaTab />}
              </div>
              {(activeTab.name === 'patterns' || activeTab.name === 'media') && (
                <div className="bi-footer">
                  <Button
                    variant="secondary"
                    className="bi-explore-btn"
                    onClick={
                      activeTab.name === 'patterns'
                        ? () => window.alert(
                          'The display of all the patterns in a modal UI is not implemented in this prototype.',
                        )
                        : undefined
                    }
                  >
                    Explore all {activeTab.name}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabPanel>
      )}
    </div>
  );
}

export default BlockInserterContent;
