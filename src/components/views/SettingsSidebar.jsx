import { useEffect, useState } from 'react';
import { Button, PanelBody, Popover, TabPanel, TextControl, Tooltip } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { closeSmall } from '@wordpress/icons';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/editCanvasBlockMeta';

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
      <PanelBody title="Template" initialOpen={false}>
        <Text variant="body-sm" className="ss-muted">Template assignment appears here in the Site Editor.</Text>
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
          <Tooltip key={id} text={title} placement="top">
            <Button
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
          </Tooltip>
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

/**
 * Six visual style variants applied to the same preview card content. Each
 * variant defines the background, text, and accent (button) colors used to
 * paint the preview shown in the hover popover.
 */
const SECTION_STYLE_VARIANTS = [
  { id: 'style-01', title: 'Style 01', bg: '#ffffff', text: '#1e1e1e', accent: '#1e1e1e', accentText: '#ffffff' },
  { id: 'style-02', title: 'Style 02', bg: '#fdd9e9', text: '#1e1e1e', accent: '#1e1e1e', accentText: '#ffffff' },
  { id: 'style-03', title: 'Style 03', bg: '#1e1e1e', text: '#ffffff', accent: '#facc15', accentText: '#1e1e1e' },
  { id: 'style-04', title: 'Style 04', bg: '#4338ca', text: '#ffffff', accent: '#f9a8d4', accentText: '#4338ca' },
  { id: 'style-05', title: 'Style 05', bg: '#fde047', text: '#1e1e1e', accent: '#1e1e1e', accentText: '#fde047' },
  { id: 'style-06', title: 'Style 06', bg: '#dcfce7', text: '#14532d', accent: '#14532d', accentText: '#dcfce7' },
];

function StylePreviewCard({ variant }) {
  return (
    <div
      className="ss-style-preview-card"
      style={{ background: variant.bg, color: variant.text }}
    >
      <Text variant="heading-md" className="ss-style-preview-title">La Mancha</Text>
      <Text variant="body-sm" className="ss-style-preview-body">
        In a village of La Mancha, the name of which I have no desire to call to mind,
        there lived not long since one of those gentlemen that keep a lance in the
        lance-rack, an old buckler, a lean hack, and a greyhound for coursing.
      </Text>
      <span
        className="ss-style-preview-button"
        style={{ background: variant.accent, color: variant.accentText }}
      >
        Read more
      </span>
    </div>
  );
}

function SectionStyleVariants() {
  const [activeId, setActiveId] = useState(SECTION_STYLE_VARIANTS[0].id);
  const [hoveredId, setHoveredId] = useState(null);
  // Anchor the Popover to the buttons wrapper so the preview stays put as
  // the user moves across buttons — only the content swaps.
  const [groupAnchor, setGroupAnchor] = useState(null);

  const showPreview = hoveredId && hoveredId !== activeId;
  const previewVariant = showPreview
    ? SECTION_STYLE_VARIANTS.find((v) => v.id === hoveredId)
    : null;

  const handleLeave = (id) => {
    setHoveredId((current) => (current === id ? null : current));
  };

  return (
    <>
      <div className="ss-style-buttons" ref={setGroupAnchor}>
        {SECTION_STYLE_VARIANTS.map(({ id, title }) => (
          <Tooltip key={id} text={title} placement="top">
            <Button
              variant="secondary"
              isPressed={id === activeId}
              className="ss-style-button"
              onClick={() => setActiveId(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => handleLeave(id)}
              onFocus={() => setHoveredId(id)}
              onBlur={() => handleLeave(id)}
            >
              {title}
            </Button>
          </Tooltip>
        ))}
      </div>
      {previewVariant && groupAnchor ? (
        <Popover
          anchor={groupAnchor}
          placement="left-start"
          offset={12}
          focusOnMount={false}
          className="ss-style-preview"
        >
          <StylePreviewCard variant={previewVariant} />
        </Popover>
      ) : null}
    </>
  );
}

function BlockTab({ icon: Icon, label, description, showLayoutAlternatives }) {
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
      {showLayoutAlternatives ? (
        <PanelBody title="Style" initialOpen>
          <SectionStyleVariants />
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
  Content: 'Content for this template.',
  Block: 'Block settings for the selected canvas region.',
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
  isTemplate,
  focusBlockTabSignal = 0,
  flashSignal = 0,
}) {
  const [tab, setTab] = useState('page');
  const [flashHighlight, setFlashHighlight] = useState(false);

  useEffect(() => {
    if (focusBlockTabSignal > 0) {
      setTab('block');
    }
  }, [focusBlockTabSignal]);

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
    ? 'Built from a section pattern—a ready-made group of blocks you can customise on the canvas.'
    : descriptionForLabel(blockMeta.label);

  const inspectorTabLabel = blockMeta.isPatternSection ? 'Section' : 'Block';
  const tabsConfig = [
    { name: 'page', title: 'Page' },
    { name: 'block', title: inspectorTabLabel },
  ];

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
        initialTabName={tab}
        onSelect={setTab}
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
            />
          )
        }
      </TabPanel>
    </div>
  );
}
