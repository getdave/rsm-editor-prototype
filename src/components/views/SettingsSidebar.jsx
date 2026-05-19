import { useEffect, useState } from 'react';
import { Button, PanelBody, Popover, TabPanel, TextControl } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { closeSmall } from '@wordpress/icons';
import {
  DEFAULT_SECTION_STYLE_ID,
  SECTION_STYLE_OPTIONS,
} from '../../constants/sectionInspectorStyles';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/blockEditorMeta';
import { EDITOR_MODES } from '../../services/blockEditorMode';

function parseSectionIndex(selectedBlockId) {
  if (!selectedBlockId?.startsWith('section-')) {
    return null;
  }
  const n = Number.parseInt(selectedBlockId.replace('section-', ''), 10);
  return Number.isFinite(n) ? n : null;
}

function SectionStylesPanel({ sectionIndex, selectedStyleId, onStyleChange }) {
  // Mirrors the Layout panel pattern: the Popover stays anchored to the
  // buttons grid and only its content swaps as the user moves across
  // buttons (instead of following each individual trigger).
  const [hoveredId, setHoveredId] = useState(null);
  const [groupAnchor, setGroupAnchor] = useState(null);

  const showPreview = hoveredId && hoveredId !== selectedStyleId;
  const previewOption = showPreview
    ? SECTION_STYLE_OPTIONS.find((o) => o.id === hoveredId)
    : null;

  const handleLeave = (id) => {
    setHoveredId((current) => (current === id ? null : current));
  };

  return (
    <div className="ss-style-picker-root">
      <div className="ss-style-grid" role="list" ref={setGroupAnchor}>
        {SECTION_STYLE_OPTIONS.map((option) => {
          const selected = option.id === selectedStyleId;
          return (
            <div className="ss-style-grid-cell" key={option.id} role="presentation">
              <button
                type="button"
                role="listitem"
                className={`ss-style-btn${selected ? ' ss-style-btn--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onStyleChange(sectionIndex, option.id)}
                onMouseEnter={() => setHoveredId(option.id)}
                onMouseLeave={() => handleLeave(option.id)}
                onFocus={() => setHoveredId(option.id)}
                onBlur={() => handleLeave(option.id)}
              >
                <Text variant="body-sm" className="ss-style-btn-label">
                  {option.label}
                </Text>
              </button>
            </div>
          );
        })}
      </div>
      {previewOption && groupAnchor ? (
        <Popover
          anchor={groupAnchor}
          placement="left-start"
          offset={12}
          focusOnMount={false}
          className="ss-style-preview"
        >
          <div className={`ss-style-preview-mock ss-style-preview-mock--${previewOption.previewMod}`}>
            <div className="ss-style-preview-mock-title">La Mancha</div>
            <p className="ss-style-preview-mock-text">
              In a village of La Mancha, the name of which I have no desire…
            </p>
            <span className="ss-style-preview-mock-cta">Read more</span>
          </div>
          <Text variant="body-sm" className="ss-style-preview-caption">
            {previewOption.label}
          </Text>
        </Popover>
      ) : null}
    </div>
  );
}

function PageTab({ pageTitle }) {
  const slug = pageTitle?.toLowerCase().replace(/\s+/g, '-') ?? '';
  return (
    <>
      <PanelBody title="Status & visibility" initialOpen>
        <Stack direction="row" align="center" justify="space-between" className="ss-field-row">
          <Text variant="body-sm" className="ss-label">Visibility</Text>
          <Text variant="body-sm" className="ss-value">Public</Text>
        </Stack>
        <Stack direction="row" align="center" justify="space-between" className="ss-field-row">
          <Text variant="body-sm" className="ss-label">Publish</Text>
          <Text variant="body-sm" className="ss-value">Immediately</Text>
        </Stack>
      </PanelBody>
      <PanelBody title="Permalink" initialOpen={false}>
        <TextControl
          __nextHasNoMarginBottom
          __next40pxDefaultSize
          label="URL slug"
          value={slug}
          readOnly
          onChange={() => {}}
        />
      </PanelBody>
      <PanelBody title="Page design" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Page design assignment appears here in the Site Editor.</Text>
      </PanelBody>
      <PanelBody title="Discussion" initialOpen={false}>
        <Stack direction="row" align="center" justify="space-between" className="ss-field-row">
          <Text variant="body-sm" className="ss-label">Allow comments</Text>
          <Text variant="body-sm" className="ss-value">Closed</Text>
        </Stack>
      </PanelBody>
    </>
  );
}

function WireframeHeroLead() {
  return (
    <div className="ss-wf ss-wf-hero-lead">
      <div className="ss-wf-hero-band" />
      <div className="ss-wf-stack">
        <div className="ss-wf-line ss-wf-line--lg" />
        <div className="ss-wf-line" />
        <div className="ss-wf-line ss-wf-line--sm" />
      </div>
    </div>
  );
}

function WireframeSplit() {
  return (
    <div className="ss-wf ss-wf-split">
      <div className="ss-wf-split-media" />
      <div className="ss-wf-split-copy">
        <div className="ss-wf-line ss-wf-line--lg" />
        <div className="ss-wf-line" />
        <div className="ss-wf-line" />
        <div className="ss-wf-line ss-wf-line--sm" />
      </div>
    </div>
  );
}

function WireframeStacked() {
  return (
    <div className="ss-wf ss-wf-stacked">
      <div className="ss-wf-line ss-wf-line--lg" />
      <div className="ss-wf-line" />
      <div className="ss-wf-line" />
      <div className="ss-wf-line ss-wf-line--sm" />
      <div className="ss-wf-line ss-wf-line--xs" />
    </div>
  );
}

function WireframeGallery() {
  return (
    <div className="ss-wf ss-wf-gallery">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="ss-wf-gallery-cell" />
      ))}
    </div>
  );
}

const SECTION_LAYOUT_PRESETS = [
  { id: 'hero-lead', title: 'Hero lead', Wireframe: WireframeHeroLead },
  { id: 'split', title: 'Split media', Wireframe: WireframeSplit },
  { id: 'stacked', title: 'Text stack', Wireframe: WireframeStacked },
  { id: 'gallery', title: 'Image grid', Wireframe: WireframeGallery },
];

function SectionLayoutAlternatives() {
  const [activeId, setActiveId] = useState(SECTION_LAYOUT_PRESETS[0].id);
  const [hoveredId, setHoveredId] = useState(null);
  // Mirrors Gutenberg's block-styles preview: the Popover anchors to the
  // wrapper element holding the button grid, not to the individual hovered
  // button — so the popover stays put as the user moves across buttons and
  // only its content swaps.
  const [groupAnchor, setGroupAnchor] = useState(null);

  const showPreview = hoveredId && hoveredId !== activeId;
  const previewPreset = showPreview
    ? SECTION_LAYOUT_PRESETS.find((p) => p.id === hoveredId)
    : null;
  const PreviewWireframe = previewPreset?.Wireframe;

  const handleLeave = (id) => {
    setHoveredId((current) => (current === id ? null : current));
  };

  return (
    <>
      <div className="ss-layout-buttons" ref={setGroupAnchor}>
        {SECTION_LAYOUT_PRESETS.map(({ id, title }) => (
          <Button
            key={id}
            variant="secondary"
            isPressed={id === activeId}
            className="ss-layout-button"
            onClick={() => setActiveId(id)}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => handleLeave(id)}
            onFocus={() => setHoveredId(id)}
            onBlur={() => handleLeave(id)}
          >
            {title}
          </Button>
        ))}
      </div>
      {previewPreset && groupAnchor ? (
        <Popover
          anchor={groupAnchor}
          placement="left-start"
          offset={12}
          focusOnMount={false}
          className="ss-layout-preview"
        >
          <div className="ss-layout-thumb" aria-hidden>
            <PreviewWireframe />
          </div>
          <Text variant="body-sm" className="ss-layout-title">
            {previewPreset.title}
          </Text>
        </Popover>
      ) : null}
    </>
  );
}

function BlockTab({
  icon: Icon,
  label,
  description,
  showLayoutAlternatives,
  showSectionStyles,
  selectedSectionIndex,
  sectionStyleId,
  onSectionStyleChange,
}) {
  return (
    <>
      <Stack direction="row" align="flex-start" gap="sm" className="ss-block-intro">
        <span className="ss-block-icon" aria-hidden>
          {Icon}
        </span>
        <Stack direction="column" gap="xs">
          <Text variant="body-md" className="ss-block-title">{label}</Text>
          <Text variant="body-sm" className="ss-block-desc">{description}</Text>
        </Stack>
      </Stack>
      {showLayoutAlternatives ? (
        <PanelBody title="Layout" initialOpen>
          <SectionLayoutAlternatives />
        </PanelBody>
      ) : null}
      {showSectionStyles && selectedSectionIndex !== null ? (
        <PanelBody title="Styles" initialOpen>
          <SectionStylesPanel
            sectionIndex={selectedSectionIndex}
            selectedStyleId={sectionStyleId}
            onStyleChange={onSectionStyleChange}
          />
        </PanelBody>
      ) : null}
      <PanelBody title="Color" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Color controls would appear here.</Text>
      </PanelBody>
      <PanelBody title="Typography" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Typography options would appear here.</Text>
      </PanelBody>
      <PanelBody title="Dimensions" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Spacing and size controls would appear here.</Text>
      </PanelBody>
      <PanelBody title="Advanced" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Additional settings would appear here.</Text>
      </PanelBody>
    </>
  );
}

const BLOCK_DESCRIPTIONS = {
  Header: 'Define the header area for your site.',
  Footer: 'Define the footer area for your site.',
  Cover: 'Wrap introductory content in an image or video.',
  Paragraph: 'Start with the basic building block of all narrative.',
  Gallery: 'Display multiple images in a rich gallery.',
  'Contact Form': 'Collect information from visitors with a form.',
  Content: 'Content for this design.',
  Block: 'Block settings for the selected region.',
};

function descriptionForLabel(label) {
  return BLOCK_DESCRIPTIONS[label] || BLOCK_DESCRIPTIONS.Block;
}

/**
 * Right-hand inspector (Page / Block tabs), WordPress Site Editor style.
 * @param {number} props.focusBlockTabSignal — increment to focus the Block/Section tab
 * @param {number} props.flashSignal — increment to run panel highlight (when already open; parent decides)
 */
export default function SettingsSidebar({
  isOpen,
  onClose,
  pageTitle,
  selectedBlockId,
  sections = [],
  mode = EDITOR_MODES.PAGE,
  focusBlockTabSignal = 0,
  flashSignal = 0,
  sectionStyles = {},
  onSectionStyleChange = () => {},
}) {
  const isTemplate = mode === EDITOR_MODES.TEMPLATE;
  const [flashHighlight, setFlashHighlight] = useState(false);

  // Each time the parent increments `focusBlockTabSignal` (e.g. clicking
  // the section toolbar's "Change Design" button), we want the inspector
  // to open on the Block/Section tab. TabPanel is uncontrolled — it only
  // reads `initialTabName` at mount — so we derive the initial directly
  // from the signal and pair it with `key={ss-tabs-${signal}}` to force a
  // fresh mount every time the signal changes. Storing the user's manual
  // tab choice in local state and updating it from a useEffect on signal
  // change loses the race against the remount.
  const initialTabName = focusBlockTabSignal > 0 ? 'block' : 'page';

  useEffect(() => {
    if (flashSignal <= 0 || !isOpen) {
      return undefined;
    }
    setFlashHighlight(false);
    const raf = window.requestAnimationFrame(() => {
      setFlashHighlight(true);
    });
    const t = window.setTimeout(() => {
      setFlashHighlight(false);
    }, 920);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [flashSignal, isOpen]);

  let blockMeta = { icon: TEMPLATE_ROOT_META.icon, label: 'Block', isPatternSection: false };
  if (selectedBlockId === 'header') {
    blockMeta = HEADER_META;
  } else if (selectedBlockId === 'footer') {
    blockMeta = FOOTER_META;
  } else if (selectedBlockId === 'template') {
    blockMeta = TEMPLATE_ROOT_META;
  } else if (selectedBlockId.startsWith('section-')) {
    const index = Number.parseInt(selectedBlockId.replace('section-', ''), 10);
    const section = sections[index];
    blockMeta = getSectionMeta(section);
  }

  const blockDescription = blockMeta.isPatternSection
    ? 'Built from a ready-made section you can customise in the Block Editor.'
    : descriptionForLabel(blockMeta.label);

  const inspectorTabLabel = blockMeta.isPatternSection ? 'Section' : 'Block';
  const tabsConfig = [
    { name: 'page', title: isTemplate ? 'Design' : 'Page' },
    { name: 'block', title: inspectorTabLabel },
  ];

  const selectedSectionIndex = parseSectionIndex(selectedBlockId);
  const showSectionStyles = Boolean(
    blockMeta.isPatternSection && selectedSectionIndex !== null
  );
  const sectionStyleId =
    showSectionStyles && selectedSectionIndex !== null
      ? sectionStyles[selectedSectionIndex] ?? DEFAULT_SECTION_STYLE_ID
      : DEFAULT_SECTION_STYLE_ID;

  return (
    <div
      className={`settings-sidebar ${isOpen ? 'open' : ''}${flashHighlight ? ' flash-highlight' : ''}`}
      role="region"
      aria-label="Settings"
      aria-hidden={!isOpen}
    >
      <Button
        className="ss-close"
        label="Close settings"
        icon={closeSmall}
        onClick={onClose}
      />
      <TabPanel
        key={`ss-tabs-${focusBlockTabSignal}`}
        className="ss-tabs"
        tabs={tabsConfig}
        initialTabName={initialTabName}
      >
        {(activeTab) =>
          activeTab.name === 'page' ? (
            <PageTab pageTitle={pageTitle || 'Untitled'} />
          ) : (
            <BlockTab
              icon={blockMeta.icon}
              label={blockMeta.label}
              description={blockDescription}
              showLayoutAlternatives={blockMeta.isPatternSection}
              showSectionStyles={showSectionStyles}
              selectedSectionIndex={selectedSectionIndex}
              sectionStyleId={sectionStyleId}
              onSectionStyleChange={onSectionStyleChange}
            />
          )
        }
      </TabPanel>
    </div>
  );
}
