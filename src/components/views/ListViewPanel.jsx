import { useState } from 'react';
import { Button, TabPanel } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { chevronRight, closeSmall } from '@wordpress/icons';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/blockEditorMeta';
import { EDITOR_MODES } from '../../services/blockEditorMode';

const TABS = [
  { name: 'list', title: 'List View' },
  { name: 'outline', title: 'Outline' },
];

/**
 * WordPress-style List View content (no outer shell). Rendered inside
 * EditorLeftPanel. Tabs use `TabPanel` from @wordpress/components, mirroring
 * the right inspector pattern from PR #31; row chrome stays bespoke
 * (Gutenberg's List View tree is not a stable WPDS primitive yet).
 *
 * @param {object} props
 * @param {() => void} props.onClose
 * @param {object[]} props.sections - page sections (when not template)
 * @param {'page' | 'template'} props.mode - Block Editor mode
 * @param {string} props.selectedBlockId - 'header' | 'footer' | 'template' | 'section-0' | …
 * @param {(id: string) => void} props.onSelectBlock
 * @param {string} props.pageTitle - document title for Outline tab
 */
export default function ListViewPanel({
  onClose,
  sections = [],
  mode = EDITOR_MODES.PAGE,
  selectedBlockId,
  onSelectBlock,
  pageTitle,
}) {
  const isTemplate = mode === EDITOR_MODES.TEMPLATE;
  const [templateExpanded, setTemplateExpanded] = useState(true);

  const renderRow = (id, meta, options = {}) => {
    const { globalBlock = false } = options;
    const selected = selectedBlockId === id;
    return (
      <button
        key={id}
        type="button"
        className={`lv-row ${selected ? 'sel' : ''} ${globalBlock ? 'lv-row-global' : ''}`}
        onClick={() => onSelectBlock(id)}
      >
        <span className="lv-row-inner">
          <span className="lv-icon" aria-hidden>
            {meta.icon}
          </span>
          <Text variant="body-md" className="lv-label">{meta.label}</Text>
          {meta.isPatternSection ? (
            <span className="lv-row-badge">section</span>
          ) : null}
        </span>
      </button>
    );
  };

  return (
    <div className="list-view-inner" role="region" aria-label="List View">
      <Button
        className="lv-close"
        label="Close List View"
        icon={closeSmall}
        onClick={onClose}
      />
      <TabPanel className="lv-tabs-panel" tabs={TABS} initialTabName="list">
        {(activeTab) => (
          <div className="lv-body">
            {activeTab.name === 'list' && (
              <div className="lv-list">
                {renderRow('header', HEADER_META, { globalBlock: true })}
                {isTemplate ? (
                  <div className="lv-template-branch">
                    <div className="lv-template-row-wrap">
                      <Button
                        className="lv-expand"
                        icon={chevronRight}
                        label={templateExpanded ? 'Collapse template' : 'Expand template'}
                        aria-expanded={templateExpanded}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateExpanded((v) => !v);
                        }}
                        iconSize={20}
                      />
                      <button
                        type="button"
                        className={`lv-row lv-row-parent ${selectedBlockId === 'template' ? 'sel' : ''}`}
                        onClick={() => onSelectBlock('template')}
                      >
                        <span className="lv-row-inner">
                          <span className="lv-icon" aria-hidden>
                            {TEMPLATE_ROOT_META.icon}
                          </span>
                          <Text variant="body-md" className="lv-label">{TEMPLATE_ROOT_META.label}</Text>
                        </span>
                      </button>
                    </div>
                    {templateExpanded && (
                      <div className="lv-nested">
                        <Text variant="body-sm" className="lv-placeholder-note">Design structure</Text>
                      </div>
                    )}
                  </div>
                ) : (
                  sections.map((section, index) =>
                    renderRow(`section-${index}`, getSectionMeta(section))
                  )
                )}
                {renderRow('footer', FOOTER_META, { globalBlock: true })}
              </div>
            )}

            {activeTab.name === 'outline' && (
              <Stack direction="column" gap="sm" className="lv-outline">
                <Text variant="heading-md" className="lv-outline-h1">{pageTitle || 'Untitled'}</Text>
                <Text variant="body-sm" className="lv-outline-muted">
                  Heading structure appears here as you add headings in the Block Editor.
                </Text>
              </Stack>
            )}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
