import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import * as wpIcons from '@wordpress/icons';

const { Icon: WPIcon } = wpIcons;
import {
  inserterBlocks,
  inserterBlockCategories,
  inserterPatterns,
} from '../../data/mockData';

const TABS = [
  { id: 'blocks', label: 'Blocks' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'media', label: 'Media' },
];

const DEFAULT_TAB = 'blocks';
const VALID_TAB_IDS = TABS.map((t) => t.id);

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
    <div className="s-opt" onClick={onInsert}>
      <Stack direction="row" align="center" justify="center" className="s-prev">
        <WPIcon icon={icon} size={28} />
      </Stack>
      <Text variant="body-sm" className="s-lbl">{block.name}</Text>
    </div>
  );
}

function PatternCard({ pattern, onInsert }) {
  return (
    <div className="s-opt" onClick={onInsert}>
      <div className="s-prev">
        <PatternPreview kind={pattern.previewKind} />
      </div>
      <Text variant="body-sm" className="s-lbl">{pattern.name}</Text>
    </div>
  );
}

/**
 * Tabbed inserter sidebar (Blocks / Patterns / Media).
 * Mirrors the "List View / Outline" tab pattern from ListViewPanel.
 * The active tab on first render comes from the `?inserter=<tab>` URL
 * param when it names a valid tab, so callers can deep-link to a tab
 * (e.g. `?inserter=patterns` from the Pages "Edit" action).
 */
export function SectionInserterContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TAB_IDS.includes(searchParams.get('inserter'))
    ? searchParams.get('inserter')
    : DEFAULT_TAB;
  const [tab, setTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  const closeInserter = () => {
    searchParams.delete('inserter');
    setSearchParams(searchParams);
  };

  const handleInsert = () => {};

  const trimmedSearch = searchTerm.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;
  const nameMatches = (name) => name.toLowerCase().includes(trimmedSearch);
  const blockMatches = isSearching
    ? inserterBlocks.filter((b) => nameMatches(b.name))
    : [];
  const patternMatches = isSearching
    ? inserterPatterns.filter((p) => nameMatches(p.name))
    : [];
  // Media has no underlying data yet, so it never contributes search hits.
  const hasAnyMatch = blockMatches.length + patternMatches.length > 0;

  const renderBlocksTab = () => (
    <>
      {inserterBlockCategories.map((cat) => {
        const blocksInCat = inserterBlocks.filter((b) => b.category === cat.id);
        if (blocksInCat.length === 0) return null;
        return (
          <div key={cat.id}>
            <Text variant="body-sm" className="s-lbl ins-group-heading">{cat.label}</Text>
            <div className="ins-grid">
              {blocksInCat.map((b) => (
                <BlockCard key={b.id} block={b} onInsert={handleInsert} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );

  const renderPatternsTab = () => (
    <Stack direction="column" gap="sm" className="ins-pattern-list">
      {inserterPatterns.map((p) => (
        <PatternCard key={p.id} pattern={p} onInsert={handleInsert} />
      ))}
    </Stack>
  );

  const renderMediaTab = () => (
    <Text variant="body-sm" className="s-lbl ins-empty-note">
      Pending
    </Text>
  );

  const renderSearchResults = () => (
    <>
      {!hasAnyMatch && (
        <Text variant="body-sm" className="s-lbl ins-empty-note">
          No results for &ldquo;{searchTerm.trim()}&rdquo;
        </Text>
      )}
      {blockMatches.length > 0 && (
        <div>
          <Text variant="body-sm" className="s-lbl ins-group-heading">Blocks</Text>
          <div className="ins-grid">
            {blockMatches.map((b) => (
              <BlockCard key={b.id} block={b} onInsert={handleInsert} />
            ))}
          </div>
        </div>
      )}
      {patternMatches.length > 0 && (
        <div>
          <Text variant="body-sm" className="s-lbl ins-group-heading">Patterns</Text>
          <Stack direction="column" gap="sm" className="ins-pattern-list">
            {patternMatches.map((p) => (
              <PatternCard key={p.id} pattern={p} onInsert={handleInsert} />
            ))}
          </Stack>
        </div>
      )}
    </>
  );

  return (
    <div className="list-view-inner" role="region" aria-label="Inserter">
      <Stack direction="row" align="center" className="ins-search-row">
        <input
          className="ins-search"
          type="search"
          placeholder="Search"
          aria-label="Search blocks, patterns, and media"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          className="lv-close"
          label="Close inserter"
          icon={wpIcons.closeSmall}
          onClick={closeInserter}
        />
      </Stack>

      {isSearching ? (
        <div className="ins-list">{renderSearchResults()}</div>
      ) : (
        <>
          <Stack direction="row" align="center" className="lv-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`lv-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </Stack>

          <div className="ins-list">
            {tab === 'blocks' && renderBlocksTab()}
            {tab === 'patterns' && renderPatternsTab()}
            {tab === 'media' && renderMediaTab()}
          </div>

          {(tab === 'patterns' || tab === 'media') && (
            <div className="ins-footer">
              <Button variant="secondary" className="ins-explore-btn">
                Explore all {tab}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SectionInserterContent;
