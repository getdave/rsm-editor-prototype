import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { Button, ButtonGroup } from '@wordpress/components';
import { undo, redo, desktop, tablet, mobile, drawerRight, moreVertical, plus, listView } from '@wordpress/icons';
import UrlBar from '../shared/UrlBar';
import SectionInserter from './SectionInserter';
import { getEditModeContent } from '../../services/pageContentService';

function EditingView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPage, hasUnsavedChanges, save, selectedDevice, setSelectedDevice, siteTitle } = useAppState();
  const [selectedSection, setSelectedSection] = useState(1);
  
  // Get page-specific content for editing
  const content = getEditModeContent(currentPage);

  const isInserterOpen = searchParams.get('inserter') === 'true';
  
  const toggleInserter = () => {
    if (isInserterOpen) {
      searchParams.delete('inserter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ inserter: 'true' });
    }
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

  // Render editable section with toolbar
  const renderEditableSection = (section, index) => {
    return (
      <div key={index} className="sec-group">
        <div 
          className={`e-sec ${selectedSection === index ? 'sel' : ''}`}
          onClick={() => setSelectedSection(index)}
        >
          <div className="sec-bar">
            <button className="sb-btn">↑</button>
            <button className="sb-btn">↓</button>
            <div className="sb-div"></div>
            <button className="sb-btn">Change design</button>
            <div className="sb-div"></div>
            <button className="sb-btn" style={{ color: '#f87171' }}>Delete</button>
          </div>
          {renderSectionContent(section)}
        </div>
        <button 
          className="add-sec" 
          onClick={() => setSearchParams({ inserter: 'true' })}
        >
          + Add section
        </button>
      </div>
    );
  };

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

  return (
    <div className={`edit-canvas ${true ? 'show' : ''}`}>
      {/* Section inserter */}
      <SectionInserter />

      {/* Editor column */}
      <div className="editor-col">
        {/* Canvas toolbar */}
        <div className="canvas-toolbar">
          {/* Left side controls */}
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
            className="ct-btn" 
            label="Document Overview"
            icon={listView}
            iconSize={20}
          />
          
          <div className="ct-space"></div>
          <UrlBar page={currentPage} />
          <div className="ct-space"></div>
          
          {/* Right side controls */}
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
            className="ct-icon-btn" 
            label="Toggle settings sidebar"
            icon={drawerRight}
            iconSize={20}
          />
          
          <Button 
            className="ct-icon-btn" 
            label="More options"
            icon={moreVertical}
            iconSize={20}
          />
          
          {!hasUnsavedChanges && <span className="ct-saved">Saved</span>}
          <Button 
            variant="primary"
            className={`ct-save ${hasUnsavedChanges ? 'show' : ''}`}
            onClick={save}
          >
            Save
          </Button>
          <Button 
            className="ct-exit" 
            onClick={() => navigate('/')}
          >
            Exit
          </Button>
        </div>

        {/* Edit scroll area */}
        <div className="edit-scroll">
          <div className="edit-card">
            {/* Header (global) */}
            <div className="sec-group">
              <div className="g-el p-header">
                <span className="p-sitename">{siteTitle}</span>
                <div className="p-nav">
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none' }}>Home</a>
                  <a href="#" style={{ color: 'rgba(255,255,255,.6)', fontSize: '11px', textDecoration: 'none', marginLeft: '14px' }}>About</a>
                </div>
                <div className="g-badge">⟳ Global — Header</div>
              </div>
              <button 
                className="add-sec" 
                onClick={() => setSearchParams({ inserter: 'true' })}
              >
                + Add section
              </button>
            </div>

            {/* Dynamic sections based on current page */}
            {content.isTemplate ? (
              renderTemplateLayout(content)
            ) : (
              content.sections.map((section, index) => renderEditableSection(section, index))
            )}

            {/* Footer (global) */}
            <div className="g-el p-footer" style={{ position: 'relative' }}>
              <span className="p-ft">© 2026 {siteTitle}</span>
              <span className="p-ft">Privacy Policy</span>
              <div className="g-badge">⟳ Global — Footer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditingView;
