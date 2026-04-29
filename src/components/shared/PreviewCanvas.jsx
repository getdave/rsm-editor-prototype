import { Button } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { getPageContent } from '../../services/pageContentService';
import UrlBar from './UrlBar';

/**
 * Reusable Preview Canvas Component
 * 
 * Displays a site preview with device switcher and edit button.
 * Dynamically renders content based on WordPress content model (pages, templates, template hierarchy).
 * 
 * WordPress Template Mapping:
 * - Content Pages → page.html template
 * - System Pages → 404.html, page.html templates
 * - WooCommerce → cart.php, checkout.php templates
 * - Archive Templates → archive.html, home.html templates
 * - Single Templates → single.html, single-product.html templates
 * 
 * @param {object} page - The page/item to preview
 * @param {function} onEdit - Callback when Edit button is clicked
 */
function PreviewCanvas({ page, onEdit }) {
  const { selectedDevice, setSelectedDevice, siteTitle } = useAppState();
  
  // Get WordPress-appropriate content for this page
  const content = getPageContent(page);

  // Render functions for different WordPress template types
  
  // Content Pages (page.html) - Regular pages with standard layout
  const renderPageLayout = (content) => (
    <>
      <div className="p-header">
        <span className="p-sitename">{siteTitle}</span>
        <div className="p-nav">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Gallery</a>
          <a href="#">Contact</a>
        </div>
      </div>
      {content.sections.map((section, index) => {
        if (section.type === 'hero') {
          return (
            <div key={index} className="p-hero">
              <div>
                <h1>{section.content.title}</h1>
                {section.content.subtitle && <p>{section.content.subtitle}</p>}
              </div>
            </div>
          );
        }
        if (section.type === 'text') {
          return (
            <div key={index} className="p-section">
              {section.title && <div className="p-st">{section.title}</div>}
              <div className="p-body">{section.content}</div>
            </div>
          );
        }
        if (section.type === 'gallery') {
          return (
            <div key={index} className="p-section">
              {section.title && <div className="p-st">{section.title}</div>}
              <div className="p-grid">
                {Array.from({ length: section.items || 3 }).map((_, i) => (
                  <div key={i} className="p-img"></div>
                ))}
              </div>
            </div>
          );
        }
        if (section.type === 'form') {
          return (
            <div key={index} className="p-section">
              {section.title && <div className="p-st">{section.title}</div>}
              <div className="p-body">
                <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                  Contact Form
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}
      <div className="p-footer">
        <span className="p-ft">© 2026 {siteTitle}</span>
        <span className="p-ft">Privacy Policy</span>
      </div>
    </>
  );

  // 404 Error Page (404.html)
  const renderErrorLayout = (content) => (
    <div className="p-error">
      <div className="p-error-content">
        <div className="p-error-code">{content.sections[0].code}</div>
        <h1 className="p-error-title">{content.sections[0].message}</h1>
        <p className="p-error-description">{content.sections[0].description}</p>
        <button className="p-error-button">Return Home</button>
      </div>
    </div>
  );

  // WooCommerce Templates (cart.php, checkout.php)
  const renderEcommerceLayout = (content) => {
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
  };

  // Archive Templates (archive.html, home.html) - Product/Blog lists
  const renderArchiveLayout = (content) => (
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

  // Single Templates (single.html, single-product.html)
  const renderSingleLayout = (content) => {
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
  };

  // Choose layout based on content type
  const renderContent = () => {
    switch (content.layout) {
      case 'error':
        return renderErrorLayout(content);
      case 'ecommerce':
        return renderEcommerceLayout(content);
      case 'archive':
        return renderArchiveLayout(content);
      case 'single':
        return renderSingleLayout(content);
      case 'default':
      default:
        return renderPageLayout(content);
    }
  };

  return (
    <div className="canvas" style={{ flexDirection: 'column', padding: 0, width: '100%' }}>
      <div className="preview-bar">
        <div className="ct-space"></div>
        <UrlBar page={page} />
        <div className="ct-space"></div>
        
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
          variant="primary"
          className="ct-edit" 
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
      <div className="preview-canvas-area">
        <div className="site-card">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default PreviewCanvas;
