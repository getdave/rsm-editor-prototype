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

  if (page.isCollection) {
    if (page.collectionKind === 'posts') {
      return getBlogCollectionContent(page);
    }
    if (page.collectionKind === 'shop') {
      return getShopCatalogContent(page);
    }
  }

  if (page.isPostsPage) {
    return getBlogPageAsPostsIndexContent(page);
  }

  // Map page types to content
  const contentMap = {
    // Content Pages (CPT: page) - Regular pages created by users
    'home': getHomeContent(),
    'about': getAboutContent(),
    'gallery': getGalleryContent(),
    'blog': getDefaultContent(page),
    'contact': getContactContent(),
    
    // System Pages (Special-purpose Templates)
    '404': get404Content(),
    'privacy-policy': getPrivacyPolicyContent(),
    
    // WooCommerce Templates (Plugin-provided)
    'cart': getCartContent(),
    'checkout': getCheckoutContent(),
    'shop': getShopCatalogContent(page),
    
    // Archive Templates (Template Hierarchy)
    'product-list': getProductListContent(),
    'product-catalog-template': getProductCatalogTemplateContent(page),
    /** Posts index at `/` when homepage displays latest posts (home.php hierarchy) */
    'blog-home-root': getBlogListContent(),
    'blog-list': getBlogListContent(),
    'posts-index-template': getPostsIndexTemplateContent(page),
    
    // Single Templates (Template Hierarchy)
    'product-single': getProductSingleContent(),
    'blog-single': getBlogSingleContent(),
    'event-list': getEventListContent(page),
    'event-single': getEventSingleContent(page),
    'search-results': getSearchResultsContent(),
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

function getShopCatalogContent(page = null) {
  return {
    layout: 'archive',
    title: page?.name ?? 'Store',
    subtitle: 'Browse photography services and products',
    wordpressContext: {
      type: 'template',
      templateFile: 'archive-product.html',
      plugin: 'WooCommerce',
      usesAssignedUrl: true
    },
    sections: [
      {
        type: 'archive-header',
        title: page?.name ?? 'Store',
        subtitle: 'Browse photography services and products'
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

function getProductCatalogTemplateContent(page = null) {
  const title = page?.name ?? 'Product listing';
  const catalog = getShopCatalogContent({ name: title });
  return {
    ...catalog,
    title,
    wordpressContext: {
      ...catalog.wordpressContext,
      type: 'template',
      usesAssignedUrl: false
    },
    sections: catalog.sections.map((section, i) =>
      i === 0 && section.type === 'archive-header'
        ? {
            ...section,
            title,
          }
        : section
    ),
  };
}

function getBlogListContent() {
  return {
    layout: 'archive',
    title: 'Latest posts',
    subtitle: 'Photography tips, stories, and updates',
    wordpressContext: {
      type: 'template',
      templateFile: 'home.html'
    },
    sections: [
      {
        type: 'archive-header',
        title: 'Latest posts',
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

function getBlogCollectionContent(page = null) {
  const archive = getBlogListContent();
  return {
    ...archive,
    title: page?.name ?? archive.title,
    wordpressContext: {
      type: 'template',
      templateFile: 'home.html',
      usesAssignedUrl: true
    },
    sections: archive.sections.map((section, i) =>
      i === 0 && section.type === 'archive-header'
        ? {
            ...section,
            title: page?.name ?? section.title,
          }
        : section
    ),
  };
}

function getPostsIndexTemplateContent(page = null) {
  const archive = getBlogListContent();
  const title = page?.name ?? 'Posts listing';
  return {
    ...archive,
    title,
    wordpressContext: {
      type: 'template',
      templateFile: 'home.html',
      usesAssignedUrl: false
    },
    sections: archive.sections.map((section, i) =>
      i === 0 && section.type === 'archive-header'
        ? {
            ...section,
            title,
          }
        : section
    ),
  };
}

function getSearchResultsContent() {
  return {
    layout: 'archive',
    title: 'Search Results',
    subtitle: 'Results matching a visitor search',
    wordpressContext: {
      type: 'template',
      templateFile: 'search.html'
    },
    sections: [
      {
        type: 'archive-header',
        title: 'Search Results',
        subtitle: 'Results matching a visitor search'
      },
      {
        type: 'post-list',
        items: [
          {
            title: 'Finding the Perfect Light for Portraits',
            date: 'April 15, 2026',
            excerpt: 'A matching post excerpt appears here as part of the generated search results.'
          },
          {
            title: 'Portrait Session',
            date: 'Product',
            excerpt: 'Matching products can appear alongside other searchable site content.'
          },
          {
            title: 'Gallery',
            date: 'Page',
            excerpt: 'Pages that match the visitor search can also be listed.'
          }
        ]
      }
    ]
  };
}

function getEventListContent(page = null) {
  return {
    layout: 'archive',
    title: 'Events',
    subtitle: 'Upcoming workshops, talks, and photography sessions',
    wordpressContext: {
      type: 'template',
      templateFile: 'archive-event.html',
      ...(page?.collectionState === 'inactive'
        ? { isInactiveCollection: true }
        : {})
    },
    sections: [
      {
        type: 'archive-header',
        title: 'Events',
        subtitle: 'Upcoming workshops, talks, and photography sessions'
      },
      {
        type: 'post-list',
        items: [
          {
            title: 'Portrait Lighting Workshop',
            date: 'June 12, 2026',
            excerpt: 'A practical evening workshop on finding and shaping natural light for portraits.'
          },
          {
            title: 'Riverside Photo Walk',
            date: 'June 28, 2026',
            excerpt: 'A guided walk focused on composition, observation, and building a stronger visual story.'
          },
          {
            title: 'Editing Workflow Q&A',
            date: 'July 9, 2026',
            excerpt: 'A small-group session covering selection, editing rhythm, and delivery workflows.'
          }
        ]
      }
    ]
  };
}

function getEventSingleContent(page = null) {
  return {
    layout: 'single',
    title: 'Portrait Lighting Workshop',
    subtitle: null,
    wordpressContext: {
      type: 'template',
      templateFile: 'single-event.html',
      ...(page?.collectionState === 'inactive'
        ? { isInactiveCollection: true }
        : {})
    },
    sections: [
      {
        type: 'post-content',
        title: 'Portrait Lighting Workshop',
        date: 'June 12, 2026',
        author: 'Events Team',
        content: 'Join a practical workshop on finding natural light, shaping it with simple tools, and building confidence while photographing portraits.'
      }
    ]
  };
}

/** Content Page (CPT) assigned as “Posts page” in Reading settings — shows latest posts */
function getBlogPageAsPostsIndexContent(page) {
  const archive = getBlogListContent();
  return {
    ...archive,
    title: page?.name ?? archive.title,
    subtitle: archive.subtitle,
    wordpressContext: {
      type: "page",
      templateFile: "home.html",
      isPostsPage: true,
    },
    sections: archive.sections.map((section, i) =>
      i === 0 && section.type === "archive-header"
        ? {
            ...section,
            title: page?.name ?? section.title,
          }
        : section
    ),
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
      title: getPlaceholderTitle(page, content.layout),
      subtitle: getPlaceholderSubtitle(),
      sections: replaceWithPlaceholders(content.sections)
    };
  }
  
  return content;
};

function getPlaceholderTitle(pageOrId, layout) {
  const pageId = typeof pageOrId === 'string' ? pageOrId : pageOrId?.id;
  const pageName = typeof pageOrId === 'string' ? null : pageOrId?.name;

  // Specific titles for known page types
  if (pageId === 'product-list') return 'Product Category Title';
  if (pageId === 'shop') return 'Store page title';
  if (pageId === 'product-catalog-template') return 'Product listing title';
  if (pageId === 'blog') return 'Blog page title';
  if (pageId === 'blog-home-root') return 'Latest posts title';
  if (pageId === 'blog-list') return 'Posts Page Title';
  if (pageId === 'posts-index-template') {
    return pageName === 'Latest posts'
      ? 'Latest posts title'
      : 'Posts listing title';
  }
  if (pageId === 'template-archive') return 'Archive Title';
  if (pageId === 'product-single') return 'Product Title';
  if (pageId === 'blog-single') return 'Post Title';
  if (pageId === 'event-list') return 'Event listing title';
  if (pageId === 'event-single') return 'Event Title';
  if (pageId === 'search-results') return 'Search results title';
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

function getPlaceholderSubtitle() {
  return null; // Most templates don't need subtitle placeholders
}

function replaceWithPlaceholders(sections) {
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
          items: section.items.map(() => ({
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
          items: section.items.map(() => ({
            name: 'Product Title',
            price: '0.00',
            excerpt: 'Product description text goes here...'
          }))
        };
      
      case 'post-list':
        return {
          ...section,
          items: section.items.map(() => ({
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
          content: 'Post content goes here. This is where the full post text would be displayed with multiple paragraphs and formatting.'
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
