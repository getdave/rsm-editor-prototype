import {
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
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

export const ADMIN_NAV_ITEMS_BASE = [
  { kind: 'item', id: 'home', icon: home, label: 'Home', path: '/', tip: "View your site's home page" },
  { kind: 'item', id: 'pages', icon: pageIcon, label: 'Pages', path: '/pages', tip: "View your site's Pages" },
  { kind: 'item', id: 'content', icon: postList, label: 'Content', path: '/content', tip: 'Manage content and page designs' },
  { kind: 'item', id: 'navigation', icon: navigation, label: 'Navigation', path: '/navigation', tip: 'Assign pages to your Main Menu and manage other menus' },
  { kind: 'item', id: 'design', icon: styles, label: 'Design', path: '/design', tip: 'Modify your site design and styling', chevron: true },
];

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
  return buildVisibleAdminNavItems(homepageDisplayMode).find(
    (item) => item.id === id,
  );
}

/** Default editable layout: every base item visible, in default order, no sections. */
export function buildDefaultNavLayout(homepageDisplayMode) {
  return buildVisibleAdminNavItems(homepageDisplayMode).map((item) => ({
    kind: 'item',
    id: item.id,
    hidden: false,
  }));
}
