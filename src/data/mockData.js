export const pages = [
  {
    id: 'home',
    slug: 'home',
    name: 'Home',
    type: 'Page',
    isLive: true,
    inMenu: true,
    isSystem: false
  },
  {
    id: 'about',
    slug: 'about',
    name: 'About',
    type: 'Page',
    isLive: true,
    inMenu: true,
    isSystem: false
  },
  {
    id: 'gallery',
    slug: 'gallery',
    name: 'Gallery',
    type: 'Page',
    isLive: true,
    inMenu: true,
    isSystem: false
  },
  {
    id: 'contact',
    slug: 'contact',
    name: 'Contact',
    type: 'Page',
    isLive: false,
    inMenu: false,
    isSystem: false
  },
  {
    id: 'privacy-policy',
    slug: 'privacy-policy',
    name: 'Privacy Policy',
    type: 'Page',
    isLive: true,
    inMenu: false,
    isSystem: true,
    badge: 'System'
  },
  {
    id: '404',
    slug: '404',
    name: '404 Page',
    type: 'Page',
    isLive: true,
    inMenu: false,
    isSystem: true,
    badge: 'System'
  },
  {
    id: 'cart',
    slug: 'cart',
    name: 'Cart',
    type: 'Page',
    isLive: true,
    inMenu: false,
    isSystem: true,
    badge: 'WooCommerce'
  },
  {
    id: 'checkout',
    slug: 'checkout',
    name: 'Checkout',
    type: 'Page',
    isLive: true,
    inMenu: false,
    isSystem: true,
    badge: 'WooCommerce'
  }
];

export const siteData = {
  name: 'My Photography Site',
  logo: null
};

export const sections = [
  { id: 'hero', name: 'Hero with image', categories: ['Tell my story', 'Show my work'] },
  { id: 'text-intro', name: 'Text intro', categories: ['Tell my story'] },
  { id: 'photo-gallery', name: 'Photo gallery', categories: ['Show my work'] },
  { id: 'about-me', name: 'About me', categories: ['Tell my story'] },
  { id: 'text-image', name: 'Text + image', categories: ['Tell my story', 'Show my work'] },
  { id: 'services-grid', name: 'Services grid', categories: ['Show my work'] },
  { id: 'contact-form', name: 'Contact form', categories: ['Contact'] },
  { id: 'testimonials', name: 'Testimonials', categories: ['Reviews'] },
  { id: 'team-members', name: 'Team members', categories: ['Tell my story'] },
  { id: 'call-to-action', name: 'Call to action', categories: ['Tell my story'] },
  { id: 'latest-posts', name: 'Latest posts', categories: ['Posts'] },
  { id: 'post-grid', name: 'Post grid', categories: ['Posts'] }
];
