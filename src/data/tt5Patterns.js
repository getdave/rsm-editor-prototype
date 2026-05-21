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
import womanSplashingWater from '../assets/images/twentytwentyfive/woman-splashing-water.webp';
import linkInBioBackground from '../assets/images/twentytwentyfive/link-in-bio-background.webp';
import linkInBioImage from '../assets/images/twentytwentyfive/link-in-bio-image.webp';
import northernButtercupsFlowers from '../assets/images/twentytwentyfive/northern-buttercups-flowers.webp';
import categoryAnthuriums from '../assets/images/twentytwentyfive/category-anthuriums.webp';
import categoryCactus from '../assets/images/twentytwentyfive/category-cactus.webp';
import categorySunflowers from '../assets/images/twentytwentyfive/category-sunflowers.webp';
import ruinsImage from '../assets/images/twentytwentyfive/ruins-image.webp';

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

export const tt5PagePatternItems = [
  {
    id: 'tt5-page-business-home',
    slug: 'twentytwentyfive/page-business-home',
    name: 'Business homepage',
    category: 'Page',
    description: 'A business homepage pattern assembled from TT5 sections.',
    previewKind: 'tt5-page-business-home',
    suggestedTitle: 'Home',
    images: {
      flower: redHibiscusCloseup,
      detail: gridFlower2,
      campanula: campanulaFlower,
      delphinium: delphiniumFlowers,
      thristle: starThristleFlower,
    },
  },
  {
    id: 'tt5-page-coming-soon',
    slug: 'twentytwentyfive/page-coming-soon',
    name: 'Coming soon',
    category: 'Page',
    description: 'A full-page coming soon cover with centered subscription call to action.',
    previewKind: 'tt5-page-coming-soon',
    suggestedTitle: 'Coming Soon',
    images: { hero: comingSoonBgImage },
  },
  {
    id: 'tt5-page-cv-bio',
    slug: 'twentytwentyfive/page-cv-bio',
    name: 'CV/bio',
    category: 'Page',
    description: 'A large typographic CV or biography page with portrait and profile links.',
    previewKind: 'tt5-page-cv-bio',
    suggestedTitle: 'About',
    images: { portrait: womanSplashingWater },
  },
  {
    id: 'tt5-page-landing-book',
    slug: 'twentytwentyfive/page-landing-book',
    name: 'Landing page for book',
    category: 'Page',
    description: 'A book landing page with hero, retailer links, book details, FAQs, and newsletter signup.',
    previewKind: 'tt5-page-landing-book',
    suggestedTitle: 'Book',
    images: { book: bookImageLanding },
  },
  {
    id: 'tt5-page-landing-event',
    slug: 'twentytwentyfive/page-landing-event',
    name: 'Landing page for event',
    category: 'Page',
    description: 'An event landing page with hero image, description, FAQs, and contact call to action.',
    previewKind: 'tt5-page-landing-event',
    suggestedTitle: 'Event',
    images: { hero: northernButtercupsFlowers, ruins: ruinsImage },
  },
  {
    id: 'tt5-page-landing-podcast',
    slug: 'twentytwentyfive/page-landing-podcast',
    name: 'Landing page for podcast',
    category: 'Page',
    description: 'A podcast landing page with hero, about section, sponsor logos, episodes, and newsletter signup.',
    previewKind: 'tt5-page-landing-podcast',
    suggestedTitle: 'Podcast',
    images: { host: heroPodcast, ruins: ruinsImage },
  },
  {
    id: 'tt5-page-link-in-bio-heading-paragraph-links-image',
    slug: 'twentytwentyfive/page-link-in-bio-heading-paragraph-links-image',
    name: 'Link in bio heading, paragraph, links and full-height image',
    category: 'Page',
    description: 'A link in bio landing page with text links and a full-height image column.',
    previewKind: 'tt5-page-link-bio-image',
    suggestedTitle: 'Links',
    images: { hero: linkInBioBackground },
  },
  {
    id: 'tt5-page-link-in-bio-wide-margins',
    slug: 'twentytwentyfive/page-link-in-bio-wide-margins',
    name: 'Link in bio with profile, links and wide margins',
    category: 'Page',
    description: 'A spacious link in bio page with profile photo, short bio, and social links.',
    previewKind: 'tt5-page-link-bio-profile',
    suggestedTitle: 'Links',
    images: { portrait: womanSplashingWater },
  },
  {
    id: 'tt5-page-link-in-bio-with-tight-margins',
    slug: 'twentytwentyfive/page-link-in-bio-with-tight-margins',
    name: 'Link in bio with tight margins',
    category: 'Page',
    description: 'A compact full-height link in bio page with image, biography copy, and links.',
    previewKind: 'tt5-page-link-bio-tight',
    suggestedTitle: 'Links',
    images: { hero: linkInBioImage },
  },
  {
    id: 'tt5-page-portfolio-home',
    slug: 'twentytwentyfive/page-portfolio-home',
    name: 'Portfolio homepage',
    category: 'Page',
    description: 'A portfolio homepage pattern with project intro and query layout placeholders.',
    previewKind: 'tt5-page-portfolio-home',
    suggestedTitle: 'Portfolio',
  },
  {
    id: 'tt5-page-shop-home',
    slug: 'twentytwentyfive/page-shop-home',
    name: 'Shop homepage',
    category: 'Page',
    description: 'A shop homepage with intro banner, product categories, and media grid.',
    previewKind: 'tt5-page-shop-home',
    suggestedTitle: 'Shop',
    images: {
      hero: botanyFlowers,
      anthuriums: categoryAnthuriums,
      cactus: categoryCactus,
      sunflowers: categorySunflowers,
    },
  },
].map((pattern) => ({
  ...pattern,
  source: SOURCE,
  syncStatus: SYNC_STATUS,
  isLocked: true,
  isTT5Pattern: true,
  isTT5PagePattern: true,
}));

export const tt5AdvancedPatterns = [...tt5PatternItems, ...tt5PagePatternItems];
