import comingSoonBgImage from '../assets/images/twentytwentyfive/coming-soon-bg-image.webp';
import posterImageBackground from '../assets/images/twentytwentyfive/poster-image-background.webp';
import bookImageLanding from '../assets/images/twentytwentyfive/book-image-landing.webp';
import gridFlower1 from '../assets/images/twentytwentyfive/grid-flower-1.webp';
import gridFlower2 from '../assets/images/twentytwentyfive/grid-flower-2.webp';
import redHibiscusCloseup from '../assets/images/twentytwentyfive/red-hibiscus-closeup.webp';
import flowerMeadowSquare from '../assets/images/twentytwentyfive/flower-meadow-square.webp';
import vashGonSquare from '../assets/images/twentytwentyfive/vash-gon-square.webp';
import coralSquare from '../assets/images/twentytwentyfive/coral-square.webp';
import agendaImg4 from '../assets/images/twentytwentyfive/agenda-img-4.webp';
import parthenonSquare from '../assets/images/twentytwentyfive/parthenon-square.webp';
import dallasCreekSquare from '../assets/images/twentytwentyfive/dallas-creek-square.webp';
import marshlandBirdsSquare from '../assets/images/twentytwentyfive/marshland-birds-square.webp';
import malibuPlantlife from '../assets/images/twentytwentyfive/malibu-plantlife.webp';
import akakaFallsStateParkFlora from '../assets/images/twentytwentyfive/akaka-falls-state-park-flora.webp';
import botanyFlowers from '../assets/images/twentytwentyfive/botany-flowers.webp';
import starThristleFlower from '../assets/images/twentytwentyfive/star-thristle-flower.webp';
import locationImage from '../assets/images/twentytwentyfive/location.webp';
import heroPodcast from '../assets/images/twentytwentyfive/hero-podcast.webp';
import campanulaFlower from '../assets/images/twentytwentyfive/campanula-alliariifolia-flower.webp';
import delphiniumFlowers from '../assets/images/twentytwentyfive/delphinium-flowers.webp';
import botanyFlowersCloseup from '../assets/images/twentytwentyfive/botany-flowers-closeup.webp';

const SOURCE = 'Twenty Twenty-Five';
const SYNC_STATUS = 'Not synced';

export const tt5PatternItems = [
  {
    id: 'tt5-banner-cover-big-heading',
    slug: 'twentytwentyfive/banner-cover-big-heading',
    name: 'Cover with big heading',
    category: 'Banner',
    description: 'A full-width cover section with a large image and oversized heading.',
    previewKind: 'tt5-cover-big-heading',
    images: { hero: comingSoonBgImage },
  },
  {
    id: 'tt5-banner-poster',
    slug: 'twentytwentyfive/banner-poster',
    name: 'Poster-like section',
    category: 'Banner',
    description: 'A poster-style event banner with large multilingual display text.',
    previewKind: 'tt5-poster',
    images: { hero: posterImageBackground },
  },
  {
    id: 'tt5-banner-about-book',
    slug: 'twentytwentyfive/banner-about-book',
    name: 'Banner with book description',
    category: 'Banner',
    description: 'A promotional book banner with description copy and an image.',
    previewKind: 'tt5-about-book',
    images: { book: bookImageLanding },
  },
  {
    id: 'tt5-banner-description-images-grid',
    slug: 'twentytwentyfive/banner-description-images-grid',
    name: 'Banner with description and images grid',
    category: 'Banner',
    description: 'A short text banner paired with an asymmetric image grid.',
    previewKind: 'tt5-description-images-grid',
    images: { flower: gridFlower1, detail: gridFlower2 },
  },
  {
    id: 'tt5-overlapped-images',
    slug: 'twentytwentyfive/overlapped-images',
    name: 'Overlapping images and paragraph on right',
    category: 'About',
    description: 'A section with overlapping images and a large descriptive paragraph.',
    previewKind: 'tt5-overlapped-images',
    images: { flower: redHibiscusCloseup, detail: gridFlower2 },
  },
  {
    id: 'tt5-media-instagram-grid',
    slug: 'twentytwentyfive/media-instagram-grid',
    name: 'Instagram grid',
    category: 'Media',
    description: 'A square media grid with a social profile callout.',
    previewKind: 'tt5-instagram-grid',
    images: {
      flowerMeadow: flowerMeadowSquare,
      portrait: vashGonSquare,
      coral: coralSquare,
      person: agendaImg4,
      parthenon: parthenonSquare,
      flowerDark: dallasCreekSquare,
      birds: marshlandBirdsSquare,
    },
  },
  {
    id: 'tt5-cta-grid-products-link',
    slug: 'twentytwentyfive/cta-grid-products-link',
    name: 'Call to action with grid layout with products and link',
    category: 'Call to action',
    description: 'A product CTA with oversized heading, mixed image grid, and shop button.',
    previewKind: 'tt5-product-grid',
    images: {
      flowerDetail: gridFlower2,
      plantlife: malibuPlantlife,
      akaka: akakaFallsStateParkFlora,
      botany: botanyFlowers,
      thristle: starThristleFlower,
    },
  },
  {
    id: 'tt5-cta-events-list',
    slug: 'twentytwentyfive/cta-events-list',
    name: 'Events list',
    category: 'Call to action',
    description: 'A stacked list of events with dates and ticket buttons.',
    previewKind: 'tt5-events-list',
  },
  {
    id: 'tt5-event-rsvp',
    slug: 'twentytwentyfive/event-rsvp',
    name: 'Event RSVP',
    category: 'Call to action',
    description: 'An event RSVP section with event details and image split.',
    previewKind: 'tt5-event-rsvp',
    images: { flowers: botanyFlowersCloseup },
  },
  {
    id: 'tt5-pricing-3-col',
    slug: 'twentytwentyfive/pricing-3-col',
    name: 'Pricing, 3 columns',
    category: 'Services',
    description: 'A three-column boxed pricing table for memberships or services.',
    previewKind: 'tt5-pricing',
  },
  {
    id: 'tt5-services-3-col',
    slug: 'twentytwentyfive/services-3-col',
    name: 'Services, 3 columns',
    category: 'Services',
    description: 'Three image-led columns for showcasing services.',
    previewKind: 'tt5-services',
    images: {
      campanula: campanulaFlower,
      delphinium: delphiniumFlowers,
      thristle: starThristleFlower,
    },
  },
  {
    id: 'tt5-hero-podcast',
    slug: 'twentytwentyfive/hero-podcast',
    name: 'Hero podcast',
    category: 'Banner',
    description: 'A dark two-column podcast hero with platform links.',
    previewKind: 'tt5-hero-podcast',
    images: { host: heroPodcast },
  },
  {
    id: 'tt5-contact-location-and-link',
    slug: 'twentytwentyfive/contact-location-and-link',
    name: 'Contact location and link',
    category: 'Contact',
    description: 'A contact location section with address, directions link, and map image.',
    previewKind: 'tt5-contact-location',
    images: { location: locationImage },
  },
  {
    id: 'tt5-contact-info-locations',
    slug: 'twentytwentyfive/contact-info-locations',
    name: 'Contact, info and locations',
    category: 'Contact',
    description: 'Contact details, social links, email, and multiple location columns.',
    previewKind: 'tt5-contact-info',
  },
  {
    id: 'tt5-cta-centered-heading',
    slug: 'twentytwentyfive/cta-centered-heading',
    name: 'Centered heading',
    category: 'Call to action',
    description: 'A simple centered heading, short paragraph, and button.',
    previewKind: 'tt5-centered-heading',
  },
].map((pattern) => ({
  ...pattern,
  source: SOURCE,
  syncStatus: SYNC_STATUS,
  isLocked: true,
  isTT5Pattern: true,
}));

export const tt5InserterPatterns = tt5PatternItems.map((pattern) => ({
  id: pattern.id,
  name: pattern.name,
  previewKind: pattern.previewKind,
  images: pattern.images,
  isTT5Pattern: true,
}));

export const tt5AdvancedPatterns = tt5PatternItems;
