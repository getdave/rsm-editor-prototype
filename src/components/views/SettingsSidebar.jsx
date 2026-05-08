import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/editCanvasBlockMeta';

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`ss-acc ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="ss-acc-hd"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="ss-acc-title">{title}</span>
        <span className="ss-acc-toggle" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="ss-acc-body">{children}</div>}
    </div>
  );
}

function PageTab({ pageTitle }) {
  return (
    <>
      <Accordion title="Status & visibility" defaultOpen>
        <div className="ss-field-row">
          <span className="ss-label">Visibility</span>
          <span className="ss-value">Public</span>
        </div>
        <div className="ss-field-row">
          <span className="ss-label">Publish</span>
          <span className="ss-value">Immediately</span>
        </div>
      </Accordion>
      <Accordion title="Permalink">
        <div className="ss-placeholder-field">
          <span className="ss-muted">URL slug</span>
          <div className="ss-fake-input">{pageTitle?.toLowerCase().replace(/\s+/g, '-')}</div>
        </div>
      </Accordion>
      <Accordion title="Template">
        <p className="ss-muted">Template assignment appears here in the Site Editor.</p>
      </Accordion>
      <Accordion title="Discussion">
        <div className="ss-field-row">
          <span className="ss-label">Allow comments</span>
          <span className="ss-value">Closed</span>
        </div>
      </Accordion>
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
  return (
    <div className="ss-layout-grid">
      {SECTION_LAYOUT_PRESETS.map(({ id, title, Wireframe }) => (
        <button key={id} type="button" className="ss-layout-card">
          <div className="ss-layout-thumb" aria-hidden>
            <Wireframe />
          </div>
          <span className="ss-layout-title">{title}</span>
        </button>
      ))}
    </div>
  );
}

function BlockTab({ icon: Icon, label, description, showLayoutAlternatives }) {
  return (
    <>
      <div className="ss-block-intro">
        <span className="ss-block-icon" aria-hidden>
          {Icon}
        </span>
        <div>
          <div className="ss-block-title">{label}</div>
          <p className="ss-block-desc">{description}</p>
        </div>
      </div>
      {showLayoutAlternatives ? (
        <Accordion title="Layout" defaultOpen>
          <SectionLayoutAlternatives />
        </Accordion>
      ) : null}
      <Accordion title="Color" defaultOpen>
        <div className="ss-color-row">
          <span className="ss-label">Text</span>
          <button type="button" className="ss-swatch ss-swatch-empty" aria-label="Text color" />
        </div>
        <div className="ss-color-row">
          <span className="ss-label">Background</span>
          <button type="button" className="ss-swatch ss-swatch-empty" aria-label="Background color" />
        </div>
      </Accordion>
      <Accordion title="Typography">
        <div className="ss-segmented">
          {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
            <button key={s} type="button" className={`ss-seg ${s === 'M' ? 'active' : ''}`}>
              {s}
            </button>
          ))}
        </div>
      </Accordion>
      <Accordion title="Dimensions">
        <p className="ss-muted">Spacing and size controls would appear here.</p>
      </Accordion>
      <Accordion title="Advanced">
        <p className="ss-muted">Additional CSS and HTML anchor settings.</p>
      </Accordion>
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

  return (
    <div
      className={`settings-sidebar ${isOpen ? 'open' : ''}${flashHighlight ? ' flash-highlight' : ''}`}
      role="region"
      aria-label="Settings"
      aria-hidden={!isOpen}
    >
      <div className="ss-head">
        <div className="ss-tabs-strip">
          <button
            type="button"
            className={`ss-tab-strip ${tab === 'page' ? 'active' : ''}`}
            onClick={() => setTab('page')}
          >
            Page
          </button>
          <button
            type="button"
            className={`ss-tab-strip ${tab === 'block' ? 'active' : ''}`}
            onClick={() => setTab('block')}
          >
            {inspectorTabLabel}
          </button>
        </div>
        <Button className="ss-close" label="Close settings" icon={closeSmall} onClick={onClose} />
      </div>
      <div className="ss-body">
        {tab === 'page' && <PageTab pageTitle={pageTitle || 'Untitled'} />}
        {tab === 'block' && (
          <BlockTab
            icon={blockMeta.icon}
            label={blockMeta.label}
            description={blockDescription}
            showLayoutAlternatives={blockMeta.isPatternSection}
          />
        )}
      </div>
    </div>
  );
}
