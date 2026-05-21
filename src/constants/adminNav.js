import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  color,
  typography,
  background,
  shadow,
  layout,
  symbolFilled,
  addTemplate,
} from '@wordpress/icons';
import { HOMEPAGE_DISPLAY_LATEST } from '../data/mockData';

/** Root admin nav — Posts inserted after Pages only when homepage shows latest posts */
export const ADMIN_NAV_ITEM_POSTS = Object.freeze({
  kind: 'item',
  id: 'posts',
  icon: postList,
  label: 'Posts',
  path: '/posts',
  tip: 'Manage Posts on your site',
});

/**
 * Homepage-reconcilable base set. These are the only ids subject to
 * reconcileNavLayout (Posts appears/disappears with the homepage setting).
 */
export const ADMIN_NAV_ITEMS_BASE = [
  { kind: 'item', id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
  { kind: 'item', id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
  { kind: 'item', id: 'content', icon: postList, label: 'Content', path: '/content', tip: 'Manage content and page designs' },
  { kind: 'item', id: 'navigation', icon: navigation, label: 'Navigation Menus', path: '/navigation', tip: 'Manage the menus used around your site' },
];

/**
 * Catalog of nav items that live inside the default Design / Advanced menus.
 * Always present (not part of the homepage-reconcilable base set), so
 * reconcileNavLayout never adds or removes them. Definitions mirror the former
 * DESIGN_NAV_ITEMS / ADVANCED_NAV_ITEMS in Sidebar.jsx.
 */
export const ADMIN_NAV_ITEM_EXTRAS = [
  { kind: 'item', id: 'styles', icon: styles, label: 'Styles', path: '/design/styles', tip: 'Site-wide styles' },
  { kind: 'item', id: 'colors', icon: color, label: 'Colors', path: '/design/styles/colors', tip: 'Colors' },
  { kind: 'item', id: 'fonts', icon: typography, label: 'Fonts', path: '/design/styles/typography', tip: 'Fonts' },
  { kind: 'item', id: 'background', icon: background, label: 'Background', path: '/design/styles/background', tip: 'Background' },
  { kind: 'item', id: 'shadows', icon: shadow, label: 'Shadows', path: '/design/styles/shadows', tip: 'Shadows' },
  { kind: 'item', id: 'layout', icon: layout, label: 'Layout', path: '/design/styles/layout', tip: 'Layout' },
  { kind: 'item', id: 'patterns', icon: symbolFilled, label: 'Patterns', path: '/patterns', tip: 'Reusable sets of blocks for layouts and sections' },
  { kind: 'item', id: 'template-parts', icon: layout, label: 'Template Parts', path: '/template-parts', tip: 'Reusable headers, footers, and template areas' },
  { kind: 'item', id: 'templates', icon: addTemplate, label: 'Templates', path: '/templates', tip: 'Edit templates that control how your site renders' },
];

const DESIGN_MENU_ITEM_IDS = ['styles', 'colors', 'fonts', 'background', 'shadows', 'layout'];
const ADVANCED_MENU_ITEM_IDS = ['patterns', 'template-parts', 'templates'];

export function buildVisibleAdminNavItems(homepageDisplayMode) {
  if (homepageDisplayMode === HOMEPAGE_DISPLAY_LATEST) {
    return [
      ADMIN_NAV_ITEMS_BASE[0],
      ADMIN_NAV_ITEMS_BASE[1],
      ADMIN_NAV_ITEM_POSTS,
      ADMIN_NAV_ITEMS_BASE[2],
      ADMIN_NAV_ITEMS_BASE[3],
    ];
  }
  return [...ADMIN_NAV_ITEMS_BASE];
}

/** Full item definition (icon/label/path/tip) for a given nav item id. */
export function getAdminNavItemById(id, homepageDisplayMode) {
  return (
    buildVisibleAdminNavItems(homepageDisplayMode).find((item) => item.id === id) ??
    ADMIN_NAV_ITEM_EXTRAS.find((item) => item.id === id)
  );
}

const toLayoutItems = (items) =>
  items.map((item) => ({ kind: 'item', id: item.id, hidden: false }));
const idsToLayoutItems = (ids) =>
  ids.map((id) => ({ kind: 'item', id, hidden: false }));

/**
 * Default sidebar layout: one unnamed Group with the main admin items, plus a
 * "Design" Menu and an "Advanced" Menu. Posts joins the main Group when the
 * homepage shows latest posts.
 */
export function buildDefaultNavLayout(homepageDisplayMode) {
  return [
    {
      kind: 'section',
      type: 'group',
      id: 'group-main',
      label: '',
      items: toLayoutItems(buildVisibleAdminNavItems(homepageDisplayMode)),
    },
    {
      kind: 'section',
      type: 'menu',
      id: 'menu-design',
      label: 'Design',
      items: idsToLayoutItems(DESIGN_MENU_ITEM_IDS),
    },
    {
      kind: 'section',
      type: 'menu',
      id: 'menu-advanced',
      label: 'Advanced',
      items: idsToLayoutItems(ADVANCED_MENU_ITEM_IDS),
    },
  ];
}
