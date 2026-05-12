import {
  cover,
  footer as footerIcon,
  gallery,
  group,
  header as headerIcon,
  layout,
  page,
  paragraph,
} from '@wordpress/icons';
import { sections as patternCatalogEntries } from '../data/mockData';

/** Icon for page sections built from the Section Inserter catalog (not block-specific). */
export const SECTION_PATTERN_ICON = layout;

/** Maps page section `type` (from pageContentService) to pattern ids in the Section Inserter catalog. */
const PATTERN_ID_BY_SECTION_TYPE = {
  hero: 'hero',
  text: 'text-intro',
  gallery: 'photo-gallery',
  form: 'contact-form',
};

const patternCatalogById = Object.fromEntries(
  patternCatalogEntries.map((entry) => [entry.id, entry])
);

function getPatternInfoForSectionType(sectionType) {
  const patternId = PATTERN_ID_BY_SECTION_TYPE[sectionType];
  if (!patternId) return null;
  const catalog = patternCatalogById[patternId];
  if (!catalog) return null;
  return { patternId, patternName: catalog.name };
}

/** Per-type icon for canvas sections (icons are React elements from @wordpress/icons). */
export const SECTION_TYPE_META = {
  hero: { icon: cover, label: 'Cover' },
  text: { icon: paragraph, label: 'Paragraph' },
  gallery: { icon: gallery, label: 'Gallery' },
  form: { icon: page, label: 'Contact Form' },
};

export const HEADER_META = {
  icon: headerIcon,
  label: 'Header',
  isPatternSection: false,
  isTemplatePart: true,
};
export const FOOTER_META = {
  icon: footerIcon,
  label: 'Footer',
  isPatternSection: false,
  isTemplatePart: true,
};
export const TEMPLATE_ROOT_META = { icon: group, label: 'Content', isPatternSection: false };

/**
 * Metadata for a page content section. When the section matches the Section Inserter catalog,
 * `label` is the pattern name and `isPatternSection` is true.
 */
export function getSectionMeta(section) {
  if (!section || !section.type) {
    return { icon: paragraph, label: 'Block', isPatternSection: false };
  }

  const pattern = getPatternInfoForSectionType(section.type);
  const typeMeta = SECTION_TYPE_META[section.type];

  if (pattern && typeMeta) {
    return {
      icon: SECTION_PATTERN_ICON,
      label: pattern.patternName,
      patternId: pattern.patternId,
      isPatternSection: true,
    };
  }

  const fallback = SECTION_TYPE_META[section.type];
  if (fallback) {
    return { ...fallback, isPatternSection: false };
  }

  return {
    icon: paragraph,
    label: String(section.type),
    isPatternSection: false,
  };
}
