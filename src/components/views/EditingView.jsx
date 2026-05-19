import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '@wordpress/components';
import {
  desktop,
  drawerRight,
  listView,
  mobile,
  moreVertical,
  plus,
  redo,
  symbolFilled,
  tablet,
  undo,
} from '@wordpress/icons';
import ExitSplitButton from '../shared/ExitSplitButton';
import DocumentActions from '../shared/DocumentActions';
import EditorLeftPanel from './EditorLeftPanel';
import SettingsSidebar from './SettingsSidebar';
import BlockToolbar from './BlockToolbar';
import { getEditModeContent } from '../../services/pageContentService';
import {
  DEFAULT_SECTION_STYLE_ID,
  sectionStyleSurfaceClass,
} from '../../constants/sectionInspectorStyles';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  shouldIsolateEditPeers,
  TEMPLATE_ROOT_META,
} from '../../utils/editCanvasBlockMeta';
import { PreviewSiteNavCluster } from '../shared/PreviewSiteChrome';
import { pages } from '../../data/mockData';
import GlobalTemplatePartEditWarningModal from '../modals/GlobalTemplatePartEditWarningModal';

const LS_GLOBAL_TEMPLATE_PART_EDIT_ACK = 'rsm-prototype-global-template-part-edit-ack';

function hasAcknowledgedGlobalTemplatePartEdit() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(LS_GLOBAL_TEMPLATE_PART_EDIT_ACK) === '1';
  } catch {
    return true;
  }
}

function acknowledgeGlobalTemplatePartEdit() {
  try {
    window.localStorage.setItem(LS_GLOBAL_TEMPLATE_PART_EDIT_ACK, '1');
  } catch {
    /* ignore quota / privacy mode */
  }
}

/** Below this block height (px), both inserters show on hover — avoids flicker on short sections. */
const INSERTER_SPLIT_MIN_HEIGHT_PX = 88;

/** Wait after pointer leaves before hiding inserters (syncs with opacity transition in canvas.css). */
const INSERTER_HIDE_DELAY_MS = 160;

function useSplitInserterPlacement() {
  const measureRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const [placement, setPlacement] = useState('none');

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearHideTimeout(), []);

  const updateFromClientY = (clientY) => {
    clearHideTimeout();
    const el = measureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = rect.height;
    if (h < INSERTER_SPLIT_MIN_HEIGHT_PX) {
      setPlacement('both');
      return;
    }
    const y = clientY - rect.top;
    setPlacement(y < h / 2 ? 'top' : 'bottom');
  };

  return {
    measureRef,
    placement,
    onGroupMouseEnter: (e) => updateFromClientY(e.clientY),
    onGroupMouseMove: (e) => updateFromClientY(e.clientY),
    onGroupMouseLeave: () => {
      clearHideTimeout();
      hideTimeoutRef.current = window.setTimeout(() => {
        hideTimeoutRef.current = null;
        setPlacement('none');
      }, INSERTER_HIDE_DELAY_MS);
    },
  };
}

function AddSectionInserterButton({ variant, onAdd }) {
  return (
    <button
      type="button"
      className={`add-sec add-sec--${variant}`}
      onClick={onAdd}
      aria-label={variant === 'top' ? 'Add section above' : 'Add section below'}
    >
      <span className="add-sec-plus" aria-hidden>{plus}</span>
      <span className="add-sec-label">Add Section</span>
    </button>
  );
}

function TemplatePartSyncBadge({ label }) {
  return (
    <span className="tp-sync-badge" aria-label={`${label} is synced across the site`}>
      <span className="tp-sync-badge-icon" aria-hidden>
        {symbolFilled}
      </span>
    </span>
  );
}

function EditableSectionGroup({
  section,
  index,
  selectedBlockId,
  selectCanvasBlock,
  openInserter,
  blockToolbarBindings,
  renderSectionContent,
  sectionStyleClass,
  spotlightOn,
}) {
  const blockId = `section-${index}`;
  const meta = getSectionMeta(section);
  const selected = selectedBlockId === blockId;
  const { measureRef, placement, onGroupMouseEnter, onGroupMouseMove, onGroupMouseLeave } =
    useSplitInserterPlacement();

  return (
    <div
      className={`sec-group${spotlightOn && selected ? ' edit-spotlight-focus' : ''}`}
      data-edit-block-id={blockId}
      data-inserter={placement}
      onMouseEnter={onGroupMouseEnter}
      onMouseMove={onGroupMouseMove}
      onMouseLeave={onGroupMouseLeave}
    >
      <AddSectionInserterButton variant="top" onAdd={openInserter} />
      <div
        ref={measureRef}
        className={`e-sec ${sectionStyleClass} ${selected ? 'sel' : ''}`}
        onClick={() => selectCanvasBlock(blockId)}
      >
        {selected && (
          <BlockToolbar toolbarKey={blockId} meta={meta} {...blockToolbarBindings} />
        )}
        {renderSectionContent(section)}
      </div>
      <AddSectionInserterButton variant="bottom" onAdd={openInserter} />
    </div>
  );
}

function EditingView() {
  const { designId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentPage,
    hasUnsavedChanges,
    pageDesigns,
    listViewOpen,
    openUnsavedChangesModal,
    selectedDevice,
    settingsSidebarOpen,
    setListViewOpen,
    setSelectedDevice,
    setSettingsSidebarOpen,
    siteTitle,
    toggleListView,
    toggleSettingsSidebar,
    menuExpanded,
  } = useAppState();
  const pageDesignTarget = designId
    ? pageDesigns.find((design) => design.id === designId)
    : null;
  const editTarget = pageDesignTarget || currentPage;
  const isPageDesignEdit = Boolean(pageDesignTarget);
  const [selectedBlockId, setSelectedBlockId] = useState('section-0');
  /** Second acknowledgment for Header/Footer before peer spotlight + global doc-actions label apply. */
  const [confirmedGlobalSpotlightBlockId, setConfirmedGlobalSpotlightBlockId] = useState(null);
  /** Shown once per browser (until acknowledged) before confirming global spotlight. */
  const [globalEditWarnForId, setGlobalEditWarnForId] = useState(null);
  /** Incremented when opening the inspector to the Block tab (e.g. section toolbar Design). */
  const [inspectorBlockTabSignal, setInspectorBlockTabSignal] = useState(0);
  /** Incremented to run the attention flash only when the inspector is already open (Design control). */
  const [inspectorFlashSignal, setInspectorFlashSignal] = useState(0);
  const [sectionStylesByIndex, setSectionStylesByIndex] = useState({});

  // Get page-specific content for editing
  const content = getEditModeContent(editTarget);

  const editNavEntries = useMemo(
    () => pages.filter((p) => p.inMenu).map((p) => ({ key: p.id, label: p.name, page: p })),
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection when switching edited documents.
    setSelectedBlockId(content.isTemplate ? 'template' : 'section-0');
    setSectionStylesByIndex({});
  }, [editTarget?.id, content.isTemplate]);

  const handleSectionStyleChange = (sectionIndex, styleId) => {
    setSectionStylesByIndex((prev) => ({ ...prev, [sectionIndex]: styleId }));
  };

  useEffect(() => {
    setConfirmedGlobalSpotlightBlockId(null);
    setGlobalEditWarnForId(null);
  }, [selectedBlockId]);

  const isInserterOpen = searchParams.get('inserter') != null;
  
  const toggleInserter = () => {
    if (isInserterOpen) {
      searchParams.delete('inserter');
      setSearchParams(searchParams);
    } else {
      setListViewOpen(false);
      setSearchParams({ inserter: 'true' });
    }
  };

  const openInserter = () => {
    setListViewOpen(false);
    setSearchParams({ inserter: 'true' });
  };

  const handleToggleListView = () => {
    if (!listViewOpen) {
      const next = new URLSearchParams(searchParams);
      next.delete('inserter');
      setSearchParams(next);
    }
    toggleListView();
  };

  const blockToolbarBindings = {
    onToggleListView: handleToggleListView,
    settingsSidebarOpen,
    setInspectorFlashSignal,
    setInspectorBlockTabSignal,
    setSettingsSidebarOpen,
  };

  const beginGlobalTemplatePartIsolation = useCallback(
    (id) => {
      if (id !== 'header' && id !== 'footer') return;
      if (selectedBlockId !== id) return;
      if (hasAcknowledgedGlobalTemplatePartEdit()) {
        setConfirmedGlobalSpotlightBlockId(id);
      } else {
        setGlobalEditWarnForId(id);
      }
    },
    [selectedBlockId],
  );

  const selectCanvasBlock = useCallback(
    (id) => {
      if (id === 'header' || id === 'footer') {
        if (selectedBlockId === id) {
          beginGlobalTemplatePartIsolation(id);
          return;
        }
        setSelectedBlockId(id);
        return;
      }
      setSelectedBlockId(id);
    },
    [selectedBlockId, beginGlobalTemplatePartIsolation],
  );

  const handleGlobalPartToolbarExit = useCallback(() => {
    setConfirmedGlobalSpotlightBlockId(null);
  }, []);

  const handleGlobalEditWarningContinue = useCallback(() => {
    const id = globalEditWarnForId;
    if (id == null) return;
    acknowledgeGlobalTemplatePartEdit();
    setConfirmedGlobalSpotlightBlockId(id);
    setGlobalEditWarnForId(null);
  }, [globalEditWarnForId]);

  const handleGlobalEditWarningDismiss = useCallback(() => {
    setGlobalEditWarnForId(null);
  }, []);

  const isolatePeersForSelection = useMemo(
    () =>
      shouldIsolateEditPeers(selectedBlockId, {
        isTemplate: Boolean(content.isTemplate),
        sections: content.sections,
      }),
    [selectedBlockId, content.isTemplate, content.sections],
  );

  const spotlightOn = useMemo(() => {
    if (!isolatePeersForSelection) return false;
    if (selectedBlockId !== 'header' && selectedBlockId !== 'footer') return true;
    return confirmedGlobalSpotlightBlockId === selectedBlockId;
  }, [isolatePeersForSelection, selectedBlockId, confirmedGlobalSpotlightBlockId]);

  const spotlightGlobalDocLabel = useMemo(() => {
    if (!spotlightOn) return null;
    if (selectedBlockId === 'header') return `${HEADER_META.label} (Global)`;
    if (selectedBlockId === 'footer') return `${FOOTER_META.label} (Global)`;
    return null;
  }, [spotlightOn, selectedBlockId]);

  // Render section content based on type
  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="p-hero">
            <div>
              <h1>{section.content.title}</h1>
              {section.content.subtitle && <p>{section.content.subtitle}</p>}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-body">{section.content}</div>
          </div>
        );
      
      case 'gallery':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-grid">
              {Array.from({ length: section.items || 3 }).map((_, i) => (
                <div key={i} className="p-img"></div>
              ))}
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className="p-section">
            {section.title && <div className="p-st">{section.title}</div>}
            <div className="p-body">
              <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                Contact Form
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="p-section">Unknown section type</div>;
    }
  };

  // Render editable section with split inserters (top vs bottom by pointer position)
  const renderEditableSection = (section, index) => (
    <EditableSectionGroup
      key={`section-${index}`}
      section={section}
      index={index}
      selectedBlockId={selectedBlockId}
      selectCanvasBlock={selectCanvasBlock}
      openInserter={openInserter}
      blockToolbarBindings={blockToolbarBindings}
      renderSectionContent={renderSectionContent}
      sectionStyleClass={sectionStyleSurfaceClass(
        sectionStylesByIndex[index] ?? DEFAULT_SECTION_STYLE_ID
      )}
      spotlightOn={spotlightOn}
    />
  );

  // Render template layout without notice banner
  const renderTemplateLayout = (content) => {
    return (
      <>
        {/* Render the actual layout structure */}
        <div className="template-preview-wrapper">
          {renderTemplatePreview(content)}
        </div>
      </>
    );
  };

  // Render template preview matching PreviewCanvas exactly
  const renderTemplatePreview = (content) => {
    switch (content.layout) {
      case 'error':
        // 404 Error Page - exact match to PreviewCanvas
        return (
          <div className="p-error">
            <div className="p-error-content">
              <div className="p-error-code">{content.sections[0].code}</div>
              <h1 className="p-error-title">{content.sections[0].message}</h1>
              <p className="p-error-description">{content.sections[0].description}</p>
              <button className="p-error-button">Return Home</button>
            </div>
          </div>
        );
      
      case 'ecommerce':
        // WooCommerce Templates - exact match to PreviewCanvas
        if (content.sections[0].type === 'cart') {
          return (
            <div className="p-ecommerce">
              <div className="p-ecommerce-header">
                <h1>{content.title}</h1>
              </div>
              <div className="p-ecommerce-content">
                <div className="p-cart-items">
                  {content.sections[0].items.map((item, index) => (
                    <div key={index} className="p-cart-item">
                      <div className="p-cart-item-name">{item.name}</div>
                      <div className="p-cart-item-details">
                        <span>Qty: {item.quantity}</span>
                        <span className="p-cart-item-price">${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-cart-summary">
                  <div className="p-cart-total">
                    <span>Total:</span>
                    <span className="p-cart-total-amount">${content.sections[0].total}</span>
                  </div>
                  <button className="p-cart-checkout-button">Proceed to Checkout</button>
                </div>
              </div>
            </div>
          );
        }
        // Checkout
        return (
          <div className="p-ecommerce">
            <div className="p-ecommerce-header">
              <h1>{content.title}</h1>
            </div>
            <div className="p-ecommerce-content">
              <div className="p-checkout-steps">
                {content.sections[0].steps.map((step, index) => (
                  <div key={index} className="p-checkout-step">
                    <span className="p-checkout-step-number">{index + 1}</span>
                    <span className="p-checkout-step-name">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'archive':
        // Archive Templates - exact match to PreviewCanvas
        return (
          <div className="p-archive">
            <div className="p-archive-header">
              <h1>{content.title}</h1>
              {content.subtitle && <p className="p-archive-subtitle">{content.subtitle}</p>}
            </div>
            <div className="p-archive-content">
              {content.sections[1].type === 'product-grid' && (
                <div className="p-product-grid">
                  {content.sections[1].items.map((item, index) => (
                    <div key={index} className="p-product-card">
                      <div className="p-product-image"></div>
                      <h3 className="p-product-name">{item.name}</h3>
                      <p className="p-product-excerpt">{item.excerpt}</p>
                      <span className="p-product-price">${item.price}</span>
                    </div>
                  ))}
                </div>
              )}
              {content.sections[1].type === 'post-list' && (
                <div className="p-post-list">
                  {content.sections[1].items.map((item, index) => (
                    <div key={index} className="p-post-item">
                      <h2 className="p-post-title">{item.title}</h2>
                      <div className="p-post-meta">{item.date}</div>
                      <p className="p-post-excerpt">{item.excerpt}</p>
                      <a href="#" className="p-post-link">Read more →</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'single': {
        // Single Templates - exact match to PreviewCanvas
        if (content.sections[0].type === 'product-detail') {
          const product = content.sections[0];
          return (
            <div className="p-single-product">
              <div className="p-product-detail">
                <div className="p-product-detail-image"></div>
                <div className="p-product-detail-content">
                  <h1>{product.name}</h1>
                  <div className="p-product-detail-price">${product.price}</div>
                  <div className="p-product-detail-description">{product.description}</div>
                  <ul className="p-product-detail-features">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button className="p-product-detail-button">Add to Cart</button>
                </div>
              </div>
            </div>
          );
        }
        // Blog single
        const post = content.sections[0];
        return (
          <div className="p-single-post">
            <article className="p-post-content">
              <h1>{post.title}</h1>
              <div className="p-post-meta">
                <span>{post.date}</span>
                <span> by {post.author}</span>
              </div>
              <div className="p-post-body">{post.content}</div>
            </article>
          </div>
        );
      }
      
      default:
        return <div className="p-section">Template content</div>;
    }
  };

  const pageInspectorTitle = isPageDesignEdit
    ? pageDesignTarget.name
    : content.title || currentPage?.name || 'Untitled';
  const templateTitle = content.isTemplate
    ? editTarget?.templateLabel ?? content.templateName ?? editTarget?.name ?? 'Template'
    : null;

  const leftPanelMode = listViewOpen ? 'list' : isInserterOpen ? 'inserter' : null;

  return (
    <div
      className="edit-canvas show"
      style={{
        // When the menu is expanded the canvas keeps its full original
        // width so its left edge sits flush against the 208px sidebar
        // while its right side runs 208px off the viewport. .main is
        // told to allow overflow so the canvas can extend past it.
        width: menuExpanded ? '100vw' : '100%',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className={`editor-col${content.isTemplate ? ' is-template-context' : ''}`}>
        {/* Canvas toolbar — full width; panels sit below this */}
        <div className="canvas-toolbar">
          {/* Left zone */}
          <ExitSplitButton />
          <Button
            variant="primary"
            className="ct-btn primary"
            onClick={toggleInserter}
            icon={plus}
            iconSize={20}
          />
          <Button
            className="ct-btn"
            label="Undo"
            icon={undo}
            iconSize={20}
          />
          <Button
            className="ct-btn"
            label="Redo"
            icon={redo}
            iconSize={20}
          />
          <Button
            className={`ct-btn ${listViewOpen ? 'active' : ''}`}
            label="Document Overview"
            icon={listView}
            iconSize={20}
            onClick={handleToggleListView}
          />

          <div className="ct-space"></div>
          {/* Center zone */}
          <DocumentActions
            document={editTarget}
            canRename={!isPageDesignEdit}
            documentLabelOverride={spotlightGlobalDocLabel}
            isTemplate={content.isTemplate}
            templateTitle={templateTitle}
          />
          <div className="ct-space"></div>

          {/* Right zone */}
          <div className="ct-view-modes">
            <Button
              className={`ct-view-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('desktop')}
              label="Desktop view"
              icon={desktop}
              iconSize={20}
            />
            <Button
              className={`ct-view-btn ${selectedDevice === 'tablet' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('tablet')}
              label="Tablet view"
              icon={tablet}
              iconSize={20}
            />
            <Button
              className={`ct-view-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => setSelectedDevice('mobile')}
              label="Mobile view"
              icon={mobile}
              iconSize={20}
            />
          </div>

          <Button
            className={`ct-icon-btn ${settingsSidebarOpen ? 'active' : ''}`}
            label="Toggle settings sidebar"
            icon={drawerRight}
            iconSize={20}
            onClick={toggleSettingsSidebar}
          />

          <Button
            className="ct-icon-btn"
            label="More options"
            icon={moreVertical}
            iconSize={20}
          />

          <Button
            variant="primary"
            className="ct-save show"
            onClick={openUnsavedChangesModal}
            disabled={!hasUnsavedChanges}
          >
            Save
          </Button>
        </div>

        <div className="editor-workspace">
          <EditorLeftPanel
            mode={leftPanelMode}
            listViewProps={{
              onClose: () => setListViewOpen(false),
              sections: content.sections,
              isTemplate: Boolean(content.isTemplate),
              selectedBlockId,
              onSelectBlock: selectCanvasBlock,
              pageTitle: pageInspectorTitle,
            }}
          />

          {/* Edit scroll area */}
          <div className="edit-scroll">
            <div className="edit-canvas-area">
              <div
                className={`edit-card preview-device-${selectedDevice}${spotlightOn ? ' edit-card--spotlight' : ''}`}
                {...(spotlightOn ? { 'data-spotlight-focus': selectedBlockId } : {})}
              >
            {/* Header (template part — no section inserters) */}
            <div
              className={`g-el p-header e-block tp-part ${selectedBlockId === 'header' ? 'sel' : ''}${
                spotlightOn && selectedBlockId === 'header' ? ' edit-spotlight-focus' : ''
              }`}
              data-edit-block-id="header"
              onClick={() => selectCanvasBlock('header')}
            >
              {selectedBlockId === 'header' && (
                <BlockToolbar
                  toolbarKey="header"
                  meta={HEADER_META}
                  {...blockToolbarBindings}
                  globalPartEditActive={
                    selectedBlockId === 'header' &&
                    confirmedGlobalSpotlightBlockId === 'header'
                  }
                  onGlobalPartEdit={() => beginGlobalTemplatePartIsolation('header')}
                  onGlobalPartEditExit={handleGlobalPartToolbarExit}
                />
              )}
              <TemplatePartSyncBadge label={HEADER_META.label} />
              <PreviewSiteNavCluster
                siteTitle={siteTitle}
                navEntries={editNavEntries}
                onNavClick={() => {}}
              />
            </div>

            {/* Document sections based on the current edit target */}
            {content.isTemplate ? (
              <div
                className={`template-edit-root e-block ${selectedBlockId === 'template' ? 'sel' : ''}${
                  spotlightOn && selectedBlockId === 'template' ? ' edit-spotlight-focus' : ''
                }`}
                data-edit-block-id="template"
                onClick={() => selectCanvasBlock('template')}
              >
                {selectedBlockId === 'template' && (
                  <BlockToolbar toolbarKey="template" meta={TEMPLATE_ROOT_META} {...blockToolbarBindings} />
                )}
                {renderTemplateLayout(content)}
              </div>
            ) : (
              content.sections.map((section, index) => renderEditableSection(section, index))
            )}

            {/* Footer (template part — no section inserters) */}
            <div
              className={`g-el p-footer e-block tp-part ${selectedBlockId === 'footer' ? 'sel' : ''}${
                spotlightOn && selectedBlockId === 'footer' ? ' edit-spotlight-focus' : ''
              }`}
              data-edit-block-id="footer"
              style={{ position: 'relative' }}
              onClick={() => selectCanvasBlock('footer')}
            >
              {selectedBlockId === 'footer' && (
                <BlockToolbar
                  toolbarKey="footer"
                  meta={FOOTER_META}
                  {...blockToolbarBindings}
                  globalPartEditActive={
                    selectedBlockId === 'footer' &&
                    confirmedGlobalSpotlightBlockId === 'footer'
                  }
                  onGlobalPartEdit={() => beginGlobalTemplatePartIsolation('footer')}
                  onGlobalPartEditExit={handleGlobalPartToolbarExit}
                />
              )}
              <TemplatePartSyncBadge label={FOOTER_META.label} />
              <span className="p-ft">© 2026 {siteTitle}</span>
              <span className="p-ft">Privacy Policy</span>
            </div>
            </div>
            </div>
          </div>

          <SettingsSidebar
            isOpen={settingsSidebarOpen}
            onClose={() => setSettingsSidebarOpen(false)}
            pageTitle={pageInspectorTitle}
            selectedBlockId={selectedBlockId}
            sections={content.sections}
            isTemplate={Boolean(content.isTemplate)}
            focusBlockTabSignal={inspectorBlockTabSignal}
            flashSignal={inspectorFlashSignal}
            sectionStyles={sectionStylesByIndex}
            onSectionStyleChange={handleSectionStyleChange}
          />
        </div>
      </div>
      {globalEditWarnForId != null ? (
        <GlobalTemplatePartEditWarningModal
          partLabel={
            globalEditWarnForId === 'header' ? HEADER_META.label : FOOTER_META.label
          }
          onDismiss={handleGlobalEditWarningDismiss}
          onContinue={handleGlobalEditWarningContinue}
        />
      ) : null}
    </div>
  );
}

export default EditingView;
