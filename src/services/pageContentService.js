/**
 * Page Content Service
 * 
 * Maps page data to WordPress-appropriate mock content for the preview canvas.
 * Follows WordPress content model: pages CPT, templates, and template hierarchy.
 * 
 * Progressive Disclosure Principle:
 * All content is presented as "Pages" in the UI. The underlying WordPress template
 * architecture (templates, template hierarchy) is not exposed to beginners.
 */

/**
 * Get mock content for a page based on WordPress content model
 * 
 * @param {object} page - Page object from mockData.js
 * @returns {object} Content object with layout, title, subtitle, sections, and WordPress context
 */
export const getPageContent = (page) => {
  if (!page) {
    return getDefaultContent();
  }

  // Map page types to content
  const contentMap = {
    // Content Pages (CPT: page) - Regular pages created by users
    'home': getHomeContent(),
    'about': getAboutContent(),
    'gallery': getGalleryContent(),
    'contact': getContactContent(),
    
    // System Pages (Special-purpose Templates)
    '404': get404Content(),
    'privacy-policy': getPrivacyPolicyContent(),
    
    // WooCommerce Templates (Plugin-provided)
    'cart': getCartContent(),
    'checkout': getCheckoutContent(),
    
    // Archive Templates (Template Hierarchy)
    'product-list': getProductListContent(),
    'blog-list': getBlogListContent(),
    
    // Single Templates (Template Hierarchy)
    'product-single': getProductSingleContent(),
    'blog-single': getBlogSingleContent(),
  };

  return contentMap[page.id] || getDefaultContent(page);
};

// Content Pages (page.html template)

function getHomeContent() {
  return {
    layout: 'default',
    title: 'Capturing moments that last forever',
    subtitle: 'Fine art & portrait photography · London',
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Capturing moments that last forever',
          subtitle: 'Fine art & portrait photography · London'
        }
      },
      {
        type: 'text',
        title: 'About my work',
        content: 'I specialise in candid portraiture and landscape photography. My work focuses on natural light and authentic emotion — the moments that tell a real story.'
      },
      {
        type: 'gallery',
        title: 'Recent work',
        items: 3
      }
    ]
  };
}

function getAboutContent() {
  return {
    layout: 'default',
    title: 'About Me',
    subtitle: 'Photographer & Visual Storyteller',
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'About Me',
          subtitle: 'Photographer & Visual Storyteller'
        }
      },
      {
        type: 'text',
        title: 'My Story',
        content: 'With over a decade of experience in photography, I\'ve had the privilege of capturing countless stories through my lens. My approach combines technical expertise with a deep appreciation for authentic moments.'
      },
      {
        type: 'text',
        title: 'My Approach',
        content: 'I believe the best photographs happen when people feel comfortable being themselves. That\'s why I focus on creating a relaxed, natural environment during every shoot.'
      }
    ]
  };
}

function getGalleryContent() {
  return {
    layout: 'default',
    title: 'Gallery',
    subtitle: 'Selected works from recent projects',
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Gallery',
          subtitle: 'Selected works from recent projects'
        }
      },
      {
        type: 'gallery',
        title: 'Portrait Work',
        items: 6
      },
      {
        type: 'gallery',
        title: 'Landscape Photography',
        items: 6
      }
    ]
  };
}

function getContactContent() {
  return {
    layout: 'default',
    title: 'Get In Touch',
    subtitle: 'Let\'s create something beautiful together',
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Get In Touch',
          subtitle: 'Let\'s create something beautiful together'
        }
      },
      {
        type: 'text',
        title: 'Contact Information',
        content: 'I\'d love to hear about your project. Whether you\'re planning a wedding, need professional headshots, or want to collaborate on a creative project, let\'s talk.'
      },
      {
        type: 'form',
        title: 'Send a Message'
      }
    ]
  };
}

// System Pages (Special Templates)

function get404Content() {
  return {
    layout: 'error',
    title: 'Page Not Found',
    subtitle: 'The page you\'re looking for doesn\'t exist',
    wordpressContext: {
      type: 'template',
      templateFile: '404.html'
    },
    sections: [
      {
        type: 'error',
        code: '404',
        message: 'Page Not Found',
        description: 'The page you\'re looking for doesn\'t exist or has been moved.'
      }
    ]
  };
}

function getPrivacyPolicyContent() {
  return {
    layout: 'default',
    title: 'Privacy Policy',
    subtitle: 'How we handle your information',
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Privacy Policy',
          subtitle: 'How we handle your information'
        }
      },
      {
        type: 'text',
        title: 'Information We Collect',
        content: 'This privacy policy explains how we collect, use, and protect your personal information when you use our website.'
      },
      {
        type: 'text',
        title: 'How We Use Your Information',
        content: 'We use your information solely to provide and improve our services. We never share your personal data with third parties without your consent.'
      }
    ]
  };
}

// WooCommerce Templates (Plugin)

function getCartContent() {
  return {
    layout: 'ecommerce',
    title: 'Shopping Cart',
    subtitle: null,
    wordpressContext: {
      type: 'template',
      templateFile: 'cart.php',
      plugin: 'WooCommerce'
    },
    sections: [
      {
        type: 'cart',
        items: [
          { name: 'Portrait Session - 2 Hours', price: 250, quantity: 1 },
          { name: 'Digital Photo Package (20 images)', price: 150, quantity: 1 }
        ],
        total: 400
      }
    ]
  };
}

function getCheckoutContent() {
  return {
    layout: 'ecommerce',
    title: 'Checkout',
    subtitle: null,
    wordpressContext: {
      type: 'template',
      templateFile: 'checkout.php',
      plugin: 'WooCommerce'
    },
    sections: [
      {
        type: 'checkout',
        steps: ['Billing Details', 'Payment Method', 'Order Review']
      }
    ]
  };
}

// Archive Templates (Template Hierarchy)

function getProductListContent() {
  return {
    layout: 'archive',
    title: 'Photography Services',
    subtitle: 'Professional photography packages',
    wordpressContext: {
      type: 'template',
      templateFile: 'archive-product.html'
    },
    sections: [
      {
        type: 'archive-header',
        title: 'Photography Services',
        subtitle: 'Professional photography packages'
      },
      {
        type: 'product-grid',
        items: [
          { name: 'Portrait Session', price: 250, excerpt: '2-hour portrait photography session' },
          { name: 'Wedding Photography', price: 2500, excerpt: 'Full day wedding coverage' },
          { name: 'Event Photography', price: 500, excerpt: 'Corporate and private events' },
          { name: 'Headshots', price: 150, excerpt: 'Professional business headshots' }
        ]
      }
    ]
  };
}

function getBlogListContent() {
  return {
    layout: 'archive',
    title: 'Blog',
    subtitle: 'Photography tips, stories, and updates',
    wordpressContext: {
      type: 'template',
      templateFile: 'home.html'
    },
    sections: [
      {
        type: 'archive-header',
        title: 'Blog',
        subtitle: 'Photography tips, stories, and updates'
      },
      {
        type: 'post-list',
        items: [
          { 
            title: 'Finding the Perfect Light for Portraits', 
            date: 'April 15, 2026',
            excerpt: 'Understanding natural light is key to creating stunning portrait photographs. Here are my top tips...'
          },
          { 
            title: 'Behind the Scenes: Wedding at Riverside Manor', 
            date: 'April 8, 2026',
            excerpt: 'A look back at one of the most beautiful weddings I\'ve had the pleasure to photograph this year...'
          },
          { 
            title: '5 Tips for Better Smartphone Photography', 
            date: 'March 28, 2026',
            excerpt: 'You don\'t need expensive gear to take great photos. These simple techniques will transform your mobile photography...'
          }
        ]
      }
    ]
  };
}

// Single Templates (Template Hierarchy)

function getProductSingleContent() {
  return {
    layout: 'single',
    title: 'Portrait Session',
    subtitle: '2-hour professional portrait photography',
    wordpressContext: {
      type: 'template',
      templateFile: 'single-product.html'
    },
    sections: [
      {
        type: 'product-detail',
        name: 'Portrait Session',
        price: 250,
        description: 'A comprehensive 2-hour portrait photography session including location scouting, professional lighting setup, and expert posing guidance. Perfect for individuals, couples, or families.',
        features: [
          '2 hours of shooting time',
          'Professional equipment and lighting',
          'Multiple outfit changes',
          '20 edited digital images',
          'Online gallery for easy sharing'
        ]
      }
    ]
  };
}

function getBlogSingleContent() {
  return {
    layout: 'single',
    title: 'Finding the Perfect Light for Portraits',
    subtitle: null,
    wordpressContext: {
      type: 'template',
      templateFile: 'single.html'
    },
    sections: [
      {
        type: 'post-content',
        title: 'Finding the Perfect Light for Portraits',
        date: 'April 15, 2026',
        author: 'Photographer',
        content: 'Understanding natural light is one of the most important skills in portrait photography. The quality, direction, and color of light can make or break an image. In this post, I\'ll share my approach to finding and working with beautiful natural light.'
      }
    ]
  };
}

// Default fallback

function getDefaultContent(page = null) {
  return {
    layout: 'default',
    title: page?.name || 'Page',
    subtitle: null,
    wordpressContext: {
      type: 'page',
      templateFile: 'page.html'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: page?.name || 'Page',
          subtitle: 'Content coming soon'
        }
      }
    ]
  };
}

/**
 * Get content appropriate for edit mode
 * Templates show their layout with generic placeholder content
 * Regular pages show real editable content
 * 
 * @param {object} page - Page object from mockData.js
 * @returns {object} Content object appropriate for editing
 */
export const getEditModeContent = (page) => {
  const content = getPageContent(page);
  
  // For templates, replace content with generic placeholders
  if (content.wordpressContext.type === 'template') {
    return {
      ...content,
      isTemplate: true,
      templateName: page.name,
      templateDescription: getTemplateDescription(content.layout),
      title: getPlaceholderTitle(page.id, content.layout),
      subtitle: getPlaceholderSubtitle(page.id, content.layout),
      sections: replaceWithPlaceholders(content.sections, content.layout, page.id)
    };
  }
  
  return content;
};

function getPlaceholderTitle(pageId, layout) {
  // Specific titles for known page types
  if (pageId === 'product-list') return 'Product Category Title';
  if (pageId === 'blog-list') return 'Blog Archive Title';
  if (pageId === 'product-single') return 'Product Title';
  if (pageId === 'blog-single') return 'Post Title';
  if (pageId === '404') return 'Error Page Title';
  if (pageId === 'cart') return 'Shopping Cart';
  if (pageId === 'checkout') return 'Checkout';
  
  // Fallback generic titles by layout
  const titles = {
    'error': 'Error Page Title',
    'ecommerce': 'Page Title',
    'archive': 'Archive Title',
    'single': 'Content Title'
  };
  return titles[layout] || 'Page Title';
}

function getPlaceholderSubtitle(pageId, layout) {
  return null; // Most templates don't need subtitle placeholders
}

function replaceWithPlaceholders(sections, layout, pageId) {
  return sections.map(section => {
    switch (section.type) {
      case 'archive-header':
        // Keep archive headers as-is since we set the title at the parent level
        return section;
      
      case 'error':
        return {
          ...section,
          code: '404',
          message: 'Error Page Title',
          description: 'Error description text goes here.'
        };
      
      case 'cart':
        return {
          ...section,
          items: section.items.map((_, index) => ({
            name: 'Product Name',
            price: '0.00',
            quantity: 1
          })),
          total: '0.00'
        };
      
      case 'checkout':
        return {
          ...section,
          steps: section.steps.map((_, index) => `Checkout Step ${index + 1}`)
        };
      
      case 'product-grid':
        return {
          ...section,
          items: section.items.map((_, index) => ({
            name: 'Product Title',
            price: '0.00',
            excerpt: 'Product description text goes here...'
          }))
        };
      
      case 'post-list':
        return {
          ...section,
          items: section.items.map((_, index) => ({
            title: 'Post Title',
            date: 'Post Date',
            excerpt: 'Post excerpt text goes here. This is a preview of the post content...'
          }))
        };
      
      case 'product-detail':
        return {
          ...section,
          name: 'Product Title',
          price: '0.00',
          description: 'Product description text goes here. This is where the full product details would be displayed.',
          features: [
            'Product feature 1',
            'Product feature 2',
            'Product feature 3'
          ]
        };
      
      case 'post-content':
        return {
          ...section,
          title: 'Post Title',
          date: 'Post Date',
          author: 'Author Name',
          content: 'Post content goes here. This is where the full blog post text would be displayed with multiple paragraphs and formatting.'
        };
      
      default:
        return section;
    }
  });
}

function getTemplateDescription(layout) {
  const descriptions = {
    'error': 'This is the 404 error template shown when a page is not found.',
    'ecommerce': 'This template is managed by WooCommerce plugin.',
    'archive': 'This template displays a list of posts or products dynamically.',
    'single': 'This template displays individual posts or products dynamically.'
  };
  return descriptions[layout] || 'This is a template.';
}
