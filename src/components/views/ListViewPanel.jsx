import { useState } from 'react';
import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { chevronRight, closeSmall } from '@wordpress/icons';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/editCanvasBlockMeta';

/**
 * WordPress-style List View content (no outer shell). Rendered inside EditorLeftPanel.
 *
 * @param {object} props
 * @param {() => void} props.onClose
 * @param {object[]} props.sections - page sections (when not template)
 * @param {boolean} props.isTemplate
 * @param {string} props.selectedBlockId - 'header' | 'footer' | 'template' | 'section-0' | …
 * @param {(id: string) => void} props.onSelectBlock
 * @param {string} props.pageTitle - document title for Outline tab
 */
export default function ListViewPanel({
  onClose,
  sections = [],
  isTemplate,
  selectedBlockId,
  onSelectBlock,
  pageTitle,
}) {
  const [tab, setTab] = useState('list');
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
      <Stack direction="row" align="center" className="lv-tabs">
        <button
          type="button"
          className={`lv-tab ${tab === 'list' ? 'active' : ''}`}
          onClick={() => setTab('list')}
        >
          List View
        </button>
        <button
          type="button"
          className={`lv-tab ${tab === 'outline' ? 'active' : ''}`}
          onClick={() => setTab('outline')}
        >
          Outline
        </button>
        <Button
          className="lv-close"
          label="Close List View"
          icon={closeSmall}
          onClick={onClose}
        />
      </Stack>

      <div className="lv-body">
        {tab === 'list' && (
          <div className="lv-list">
            {renderRow('header', HEADER_META, { globalBlock: true })}
            {isTemplate ? (
              <div className="lv-template-branch">
                <div className="lv-template-row-wrap">
                  <button
                    type="button"
                    className="lv-expand"
                    aria-expanded={templateExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplateExpanded((v) => !v);
                    }}
                  >
                    <span className={`lv-chevron ${templateExpanded ? 'open' : ''}`}>
                      {chevronRight}
                    </span>
                  </button>
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
                    <Text variant="body-sm" className="lv-placeholder-note">Template structure</Text>
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

        {tab === 'outline' && (
          <Stack direction="column" gap="sm" className="lv-outline">
            <Text variant="heading-md" className="lv-outline-h1">{pageTitle || 'Untitled'}</Text>
            <Text variant="body-sm" className="lv-outline-muted">
              Heading structure appears here as you add headings in the canvas.
            </Text>
          </Stack>
        )}
      </div>
    </div>
  );
}
