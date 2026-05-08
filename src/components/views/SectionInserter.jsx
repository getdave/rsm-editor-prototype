import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@wordpress/components';
import * as wpIcons from '@wordpress/icons';

const { Icon: WPIcon } = wpIcons;
import {
  inserterBlocks,
  inserterBlockCategories,
  inserterPatterns,
} from '../../data/mockData';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'media', label: 'Media' },
];

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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: '100%' }}>
        <div className="ln img" style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div className="ln s"></div>
          <div className="ln f"></div>
          <div className="ln m"></div>
        </div>
      </div>
    );
  }
  if (kind === 'gallery') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', height: '100%' }}>
        <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
        <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
        <div style={{ background: '#d0d0d0', borderRadius: '2px' }}></div>
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
      <div
        className="s-prev"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <WPIcon icon={icon} size={28} />
      </div>
      <div className="s-lbl">{block.name}</div>
    </div>
  );
}

function PatternCard({ pattern, onInsert }) {
  return (
    <div className="s-opt" onClick={onInsert}>
      <div className="s-prev">
        <PatternPreview kind={pattern.previewKind} />
      </div>
      <div className="s-lbl">{pattern.name}</div>
    </div>
  );
}

/**
 * Tabbed inserter sidebar (All / Blocks / Patterns / Media).
 * Mirrors the "List View / Outline" tab pattern from ListViewPanel.
 */
export function SectionInserterContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const closeInserter = () => {
    searchParams.delete('inserter');
    setSearchParams(searchParams);
  };

  const handleInsert = () => {
    closeInserter();
  };

  const term = searchTerm.trim().toLowerCase();
  const matches = (name) => !term || name.toLowerCase().includes(term);

  const essentialBlocks = inserterBlocks.filter((b) => b.essential);
  const filteredBlocks = inserterBlocks.filter((b) => matches(b.name));
  const filteredPatterns = inserterPatterns.filter((p) => matches(p.name));

  const groupHeadingStyle = {
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#757575',
    padding: '12px 4px 8px',
  };

  const renderAllTab = () => (
    <>
      <div className="s-lbl" style={groupHeadingStyle}>Essential blocks</div>
      <div className="ins-grid">
        {essentialBlocks.map((b) => (
          <BlockCard key={b.id} block={b} onInsert={handleInsert} />
        ))}
      </div>
      <div className="s-lbl" style={groupHeadingStyle}>Patterns</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {inserterPatterns.slice(0, 3).map((p) => (
          <PatternCard key={p.id} pattern={p} onInsert={handleInsert} />
        ))}
      </div>
    </>
  );

  const renderBlocksTab = () => (
    <>
      {inserterBlockCategories.map((cat) => {
        const blocksInCat = filteredBlocks.filter((b) => b.category === cat.id);
        if (blocksInCat.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="s-lbl" style={groupHeadingStyle}>{cat.label}</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px' }}>
      {filteredPatterns.map((p) => (
        <PatternCard key={p.id} pattern={p} onInsert={handleInsert} />
      ))}
    </div>
  );

  const renderMediaTab = () => (
    <div className="s-lbl" style={{ padding: '16px 4px', color: '#757575' }}>
      Pending
    </div>
  );

  return (
    <div className="list-view-inner" role="region" aria-label="Inserter">
      <div className="lv-tabs">
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
        <Button
          className="lv-close"
          label="Close inserter"
          icon={wpIcons.closeSmall}
          onClick={closeInserter}
        />
      </div>

      <div className="ins-search-wrap">
        <input
          className="ins-search"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ins-list">
        {tab === 'all' && renderAllTab()}
        {tab === 'blocks' && renderBlocksTab()}
        {tab === 'patterns' && renderPatternsTab()}
        {tab === 'media' && renderMediaTab()}
      </div>
    </div>
  );
}

export default SectionInserterContent;
