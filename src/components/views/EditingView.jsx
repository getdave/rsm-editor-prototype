import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '@wordpress/components';
import { Text } from '@wordpress/ui';
import {
  chevronDown,
  chevronUp,
  desktop,
  dragHandle,
  drawerRight,
  listView,
  mobile,
  moreVertical,
  plus,
  redo,
  styles,
  tablet,
  undo,
} from '@wordpress/icons';
import ExitSplitButton from '../shared/ExitSplitButton';
import DocumentActions from '../shared/DocumentActions';
import EditorLeftPanel from './EditorLeftPanel';
import SettingsSidebar from './SettingsSidebar';
import { getEditModeContent } from '../../services/pageContentService';
import {
  FOOTER_META,
  getSectionMeta,
  HEADER_META,
  TEMPLATE_ROOT_META,
} from '../../utils/editCanvasBlockMeta';

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

function EditableSectionGroup({
  section,
  index,
  selectedBlockId,
  setSelectedBlockId,
  openInserter,
  renderBlockToolbar,
  renderSectionContent,
}) {
  const blockId = `section-${index}`;
  const meta = getSectionMeta(section);
  const selected = selectedBlockId === blockId;
  const { measureRef, placement, onGroupMouseEnter, onGroupMouseMove, onGroupMouseLeave } =
    useSplitInserterPlacement();

  return (
    <div
      className="sec-group"
      data-inserter={placement}
      onMouseEnter={onGroupMouseEnter}
      onMouseMove={onGroupMouseMove}
      onMouseLeave={onGroupMouseLeave}
    >
      <AddSectionInserterButton variant="top" onAdd={openInserter} />
      <div
        ref={measureRef}
        className={`e-sec ${selected ? 'sel' : ''}`}
        onClick={() => setSelectedBlockId(blockId)}
      >
        {selected && renderBlockToolbar(meta)}
        {renderSectionContent(section)}
      </div>
      <AddSectionInserterButton variant="bottom" onAdd={openInserter} />
    </div>
  );
}

function EditingView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentPage,
    hasUnsavedChanges,
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
  const [selectedBlockId, setSelectedBlockId] = useState('section-0');
  /** Incremented when opening the inspector to the Block tab (e.g. section toolbar Design). */
  const [inspectorBlockTabSignal, setInspectorBlockTabSignal] = useState(0);
  /** Incremented to run the attention flash only when the inspector is already open (Design control). */
  const [inspectorFlashSignal, setInspectorFlashSignal] = useState(0);


  // Get page-specific content for editing
  const content = getEditModeContent(currentPage);

  useEffect(() => {
    setSelectedBlockId(content.isTemplate ? 'template' : 'section-0');
  }, [currentPage?.id, content.isTemplate]);

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

  const renderBlockToolbar = (meta) => {
    const Icon = meta.icon;
    const isPatternSection = Boolean(meta.isPatternSection);
    return (
      <div
        className={`sec-bar block-toolbar${isPatternSection ? ' block-toolbar--pattern-section' : ''}`}
        role="toolbar"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="bt-pill">
          <Button
            className="bt-pill-icon"
            label={`${meta.label} — toggle document overview`}
            icon={Icon}
            iconSize={24}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleListView();
            }}
          />
          <Text variant="body-sm" className="bt-pill-label">{meta.label}</Text>
        </div>
        <span className="bt-sep" aria-hidden />
        <Button className="bt-tb-btn" label="Drag" icon={dragHandle} iconSize={24} />
        <div className="bt-move-stack" role="group" aria-label="Reorder">
          <button type="button" className="bt-move-btn" aria-label="Move up">
            <span className="bt-move-icon" aria-hidden>{chevronUp}</span>
          </button>
          <button type="button" className="bt-move-btn" aria-label="Move down">
            <span className="bt-move-icon" aria-hidden>{chevronDown}</span>
          </button>
        </div>
        <span className="bt-sep" aria-hidden />
        {isPatternSection ? (
          <>
            <Button
              className="bt-tb-edit"
              variant="tertiary"
              icon={styles}
              label="Change Design"
              onClick={(e) => {
                e.stopPropagation();
                if (settingsSidebarOpen) {
                  setInspectorFlashSignal((n) => n + 1);
                }
                setInspectorBlockTabSignal((n) => n + 1);
                setSettingsSidebarOpen(true);
              }}
            />
            <span className="bt-sep" aria-hidden />
          </>
        ) : null}
        <Button className="bt-tb-btn" label="Options" icon={moreVertical} iconSize={24} />
      </div>
    );
  };

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
      setSelectedBlockId={setSelectedBlockId}
      openInserter={openInserter}
      renderBlockToolbar={renderBlockToolbar}
      renderSectionContent={renderSectionContent}
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
      
      case 'single':
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
      
      default:
        return <div className="p-section">Template content</div>;
    }
  };

  const pageInspectorTitle = content.title || currentPage?.name || 'Untitled';

  const leftPanelMode = listViewOpen ? 'list' : isInserterOpen ? 'inserter' : null;

  return (
    <div
      className={`edit-canvas ${true ? 'show' : ''}`}
      style={{
        // When the menu is expanded the canvas keeps its full original
        // width so its left edge sits flush against the 208px sidebar
        // while its right side runs 208px off the viewport. .main is
        // told to allow overflow so the canvas can extend past it.
        width: menuExpanded ? '100vw' : '100%',
        transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="editor-col">
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
          <DocumentActions />
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
              onSelectBlock: setSelectedBlockId,
              pageTitle: pageInspectorTitle,
            }}
          />

          {/* Edit scroll area */}
          <div className="edit-scroll">
            <div className={`edit-card preview-device-${selectedDevice}`}>
            {/* Header (template part — no section inserters) */}
            <div
              className={`g-el p-header e-block ${selectedBlockId === 'header' ? 'sel' : ''}`}
              onClick={() => setSelectedBlockId('header')}
            >
              {selectedBlockId === 'header' && renderBlockToolbar(HEADER_META)}
              <span className="p-sitename">{siteTitle}</span>
              <div className="p-nav">
                <a
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '11px',
                    textDecoration: 'none',
                  }}
                >
                  Home
                </a>
                <a
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,.6)',
                    fontSize: '11px',
                    textDecoration: 'none',
                    marginLeft: '14px',
                  }}
                >
                  About
                </a>
              </div>
              <div className="g-badge">⟳ Global — Header</div>
            </div>

            {/* Dynamic sections based on current page */}
            {content.isTemplate ? (
              <div
                className={`template-edit-root e-block ${selectedBlockId === 'template' ? 'sel' : ''}`}
                onClick={() => setSelectedBlockId('template')}
              >
                {selectedBlockId === 'template' && renderBlockToolbar(TEMPLATE_ROOT_META)}
                {renderTemplateLayout(content)}
              </div>
            ) : (
              content.sections.map((section, index) => renderEditableSection(section, index))
            )}

            {/* Footer (template part — no section inserters) */}
            <div
              className={`g-el p-footer e-block ${selectedBlockId === 'footer' ? 'sel' : ''}`}
              style={{ position: 'relative' }}
              onClick={() => setSelectedBlockId('footer')}
            >
              {selectedBlockId === 'footer' && renderBlockToolbar(FOOTER_META)}
              <span className="p-ft">© 2026 {siteTitle}</span>
              <span className="p-ft">Privacy Policy</span>
              <div className="g-badge">⟳ Global — Footer</div>
            </div>
            </div>
          </div>

          <SettingsSidebar
            isOpen={settingsSidebarOpen}
            onClose={() => setSettingsSidebarOpen(false)}
            pageTitle={pageInspectorTitle}
            selectedBlockId={selectedBlockId}
            sections={content.sections}
            focusBlockTabSignal={inspectorBlockTabSignal}
            flashSignal={inspectorFlashSignal}
          />
        </div>
      </div>
    </div>
  );
}

export default EditingView;
