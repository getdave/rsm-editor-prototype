import {
  cover,
  footer as footerIcon,
  gallery,
  group,
  header as headerIcon,
  page,
  paragraph,
} from '@wordpress/icons';

/** Per-type icon + label for canvas blocks (icons are React elements from @wordpress/icons). */
export const SECTION_TYPE_META = {
  hero: { icon: cover, label: 'Cover' },
  text: { icon: paragraph, label: 'Paragraph' },
  gallery: { icon: gallery, label: 'Gallery' },
  form: { icon: page, label: 'Contact Form' },
};

export const HEADER_META = { icon: headerIcon, label: 'Header' };
export const FOOTER_META = { icon: footerIcon, label: 'Footer' };
export const TEMPLATE_ROOT_META = { icon: group, label: 'Content' };

export function getSectionMeta(section) {
  if (!section || !section.type) {
    return { icon: paragraph, label: 'Block' };
  }
  return SECTION_TYPE_META[section.type] || { icon: paragraph, label: section.type };
}
