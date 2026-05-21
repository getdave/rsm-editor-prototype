function PreviewImage({ src, className = '' }) {
  if (!src) {
    return <span className={`tt5-preview-image ${className}`} aria-hidden="true" />;
  }
  return (
    <img
      className={`tt5-preview-image ${className}`}
      src={src}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

function ButtonPill({ children }) {
  return <span className="tt5-preview-button">{children}</span>;
}

function ProductCell({ children, image, accent }) {
  return (
    <span className={`tt5-product-cell${accent ? ` is-${accent}` : ''}`}>
      {image ? <PreviewImage src={image} /> : children}
    </span>
  );
}

function TT5PatternPreview({ pattern }) {
  const kind = pattern.previewKind;
  const images = pattern.images ?? {};

  if (kind === 'tt5-cover-big-heading') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--cover-big-heading" aria-hidden="true">
        <PreviewImage src={images.hero} />
        <span className="tt5-display-title">Stories</span>
      </div>
    );
  }

  if (kind === 'tt5-poster') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--poster" aria-hidden="true">
        <PreviewImage src={images.hero} />
        <span className="tt5-poster-title">"Stories,<br />historias,<br />histories"</span>
        <span className="tt5-poster-meta">Aug 08-10 2025<br />Mexico City</span>
      </div>
    );
  }

  if (kind === 'tt5-about-book') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--about-book" aria-hidden="true">
        <div className="tt5-preview-copy">
          <h3>About the book</h3>
          <p>This exquisite compilation showcases moments from different eras and cultures.</p>
        </div>
        <PreviewImage src={images.book} />
      </div>
    );
  }

  if (kind === 'tt5-description-images-grid') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--description-images-grid" aria-hidden="true">
        <div className="tt5-preview-copy">
          <span className="tt5-eyebrow">About Us</span>
          <p><strong>Fleurs</strong> is a flower delivery and subscription business.</p>
        </div>
        <PreviewImage src={images.flower} />
        <PreviewImage src={images.detail} />
      </div>
    );
  }

  if (kind === 'tt5-overlapped-images') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--overlapped-images" aria-hidden="true">
        <div className="tt5-overlap-stack">
          <PreviewImage src={images.flower} />
          <PreviewImage src={images.detail} />
        </div>
        <div className="tt5-preview-copy">
          <span className="tt5-eyebrow">About Us</span>
          <p>Fleurs is a flower delivery and subscription business.</p>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-instagram-grid') {
    const gridImages = [
      images.flowerMeadow,
      images.portrait,
      images.coral,
      images.person,
      images.parthenon,
      images.flowerDark,
      images.birds,
    ];
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--instagram-grid" aria-hidden="true">
        <span className="tt5-social-tile">Instagram<br /><small>@example</small></span>
        {gridImages.map((image, index) => (
          <PreviewImage key={index} src={image} />
        ))}
      </div>
    );
  }

  if (kind === 'tt5-product-grid') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--product-grid" aria-hidden="true">
        <span className="tt5-product-title">Our online store.</span>
        <div className="tt5-product-grid">
          <ProductCell image={images.flowerDetail} />
          <ProductCell>Delivered every week</ProductCell>
          <ProductCell image={images.plantlife} />
          <ProductCell accent="dark" />
          <ProductCell>Starting at<br /><strong>30€</strong></ProductCell>
          <ProductCell image={images.akaka} />
          <ProductCell>Free shipping</ProductCell>
          <ProductCell accent="bright" />
          <ProductCell image={images.botany} />
          <ProductCell image={images.thristle} />
        </div>
        <ButtonPill>Shop now</ButtonPill>
      </div>
    );
  }

  if (kind === 'tt5-events-list') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--events-list" aria-hidden="true">
        <h3>Upcoming events</h3>
        {[0, 1, 2, 3].map((row) => (
          <div className="tt5-event-row" key={row}>
            <span>Tell your story</span>
            <span>Mon, Jan 1</span>
            <ButtonPill>Buy tickets</ButtonPill>
          </div>
        ))}
      </div>
    );
  }

  if (kind === 'tt5-event-rsvp') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--event-rsvp" aria-hidden="true">
        <div className="tt5-rsvp-top">
          <span>"Stories, historias, histories"</span>
          <small>Free workshop</small>
        </div>
        <div className="tt5-rsvp-bottom">
          <p>This immersive event celebrates history and ancestry.</p>
          <strong>RSVP</strong>
          <PreviewImage src={images.flowers} />
        </div>
      </div>
    );
  }

  if (kind === 'tt5-pricing') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--pricing" aria-hidden="true">
        <h3>Choose your membership</h3>
        <div className="tt5-pricing-grid">
          {['Free', 'Single', 'Expert'].map((tier, index) => (
            <span className="tt5-price-card" key={tier}>
              <strong>{tier}</strong>
              <em>{index === 0 ? '0 EUR' : `${index * 20} EUR`}</em>
              <ButtonPill>Join</ButtonPill>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (kind === 'tt5-services') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--services" aria-hidden="true">
        <h3>Our services</h3>
        <div className="tt5-services-grid">
          {[
            ['Collect', images.campanula],
            ['Assemble', images.delphinium],
            ['Deliver', images.thristle],
          ].map(([title, image]) => (
            <span className="tt5-service-card" key={title}>
              <PreviewImage src={image} />
              <strong>{title}</strong>
              <em>Like flowers that bloom in unexpected places.</em>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (kind === 'tt5-hero-podcast') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--hero-podcast" aria-hidden="true">
        <PreviewImage src={images.host} />
        <div className="tt5-preview-copy">
          <h3>The Stories Podcast</h3>
          <p>Storytelling, expert analysis, and vivid descriptions.</p>
          <span className="tt5-platforms">YouTube Apple Podcasts Spotify RSS</span>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-contact-location') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--contact-location" aria-hidden="true">
        <div className="tt5-preview-copy">
          <p>Visit us at 123 Example St. Manhattan, NY 10300, United States</p>
          <span>Get directions</span>
        </div>
        <PreviewImage src={images.location} />
      </div>
    );
  }

  if (kind === 'tt5-contact-info') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--contact-info" aria-hidden="true">
        <h3>How to get in touch with us</h3>
        <div className="tt5-contact-grid">
          <span>Social media<br />X<br />Instagram<br />Facebook</span>
          <span>New York<br />123 Example St.</span>
          <span>San Diego<br />123 Example St.</span>
          <span>Portland<br />123 Example St.</span>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-centered-heading') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--centered-heading" aria-hidden="true">
        <h3>Tell your story</h3>
        <p>Every story unfolds with beauty and resilience.</p>
        <ButtonPill>Learn more</ButtonPill>
      </div>
    );
  }

  if (kind === 'tt5-page-business-home') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-business" aria-hidden="true">
        <section className="tt5-page-band is-centered">
          <h3>Tell your story</h3>
          <p>Like flowers that bloom in unexpected places, every story unfolds.</p>
          <ButtonPill>Learn more</ButtonPill>
        </section>
        <section className="tt5-page-band tt5-page-about">
          <div className="tt5-page-overlap">
            <PreviewImage src={images.flower} />
            <PreviewImage src={images.detail} />
          </div>
          <p><strong>Fleurs</strong> is a flower delivery and subscription business.</p>
        </section>
        <section className="tt5-page-band tt5-page-services-strip">
          {[images.campanula, images.delphinium, images.thristle].map((image, index) => (
            <PreviewImage key={index} src={image} />
          ))}
        </section>
      </div>
    );
  }

  if (kind === 'tt5-page-coming-soon') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-coming-soon" aria-hidden="true">
        <PreviewImage src={images.hero} />
        <div className="tt5-page-cover-copy">
          <span className="tt5-eyebrow">Event</span>
          <h3>Something great is coming soon</h3>
          <p>Subscribe to get notified when our website is ready.</p>
          <ButtonPill>Subscribe</ButtonPill>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-page-cv-bio') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-cv" aria-hidden="true">
        <div>
          <span className="tt5-page-hey">Hey,</span>
          <p>My name is Nora Winslow Keene, and I am a committed public interest attorney.</p>
        </div>
        <div>
          <PreviewImage src={images.portrait} />
          <span>Instagram<br />LinkedIn<br />Now</span>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-page-landing-book') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-book" aria-hidden="true">
        <section className="tt5-page-book-hero">
          <PreviewImage src={images.book} />
          <div>
            <h3>The Stories Book</h3>
            <p>A fine collection of moments in time featuring historical photographs.</p>
          </div>
        </section>
        <section className="tt5-page-book-links">
          <p>Buy your copy of The Stories Book</p>
          <div>
            {['Amazon', 'Audible', 'Bookshop', 'Spotify', 'BAM', 'Apple Books'].map((label) => (
              <ButtonPill key={label}>{label}</ButtonPill>
            ))}
          </div>
        </section>
        <section className="tt5-page-faint-card" />
      </div>
    );
  }

  if (kind === 'tt5-page-landing-event') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-event" aria-hidden="true">
        <section className="tt5-page-event-hero">
          <PreviewImage src={images.hero} />
          <div>
            <h3>Tell your story</h3>
            <p>Like flowers that bloom in unexpected places.</p>
            <ButtonPill>Learn more</ButtonPill>
          </div>
        </section>
        <section className="tt5-page-event-about">
          <div>
            <h3>About the event</h3>
            <p>A weekend of exhibitions, workshops, and panel discussions.</p>
          </div>
          <PreviewImage src={images.ruins} />
        </section>
      </div>
    );
  }

  if (kind === 'tt5-page-landing-podcast') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-podcast" aria-hidden="true">
        <section>
          <PreviewImage src={images.host} />
          <div>
            <h3>The Stories Podcast</h3>
            <p>Storytelling, expert analysis, and vivid descriptions.</p>
            <span className="tt5-platforms">YouTube Apple Podcasts Spotify</span>
          </div>
        </section>
        <section>
          <div>
            <h3>About the event</h3>
            <p>A curated selection of stories from various corners of the globe.</p>
          </div>
          <PreviewImage src={images.ruins} />
        </section>
      </div>
    );
  }

  if (kind === 'tt5-page-link-bio-image') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-link-image" aria-hidden="true">
        <div>
          <h3>Lewis Hine</h3>
          <p>Lewis W. Hine studied sociology before moving to New York.</p>
          <span>Instagram X TikTok</span>
        </div>
        <PreviewImage src={images.hero} />
      </div>
    );
  }

  if (kind === 'tt5-page-link-bio-profile') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-link-profile" aria-hidden="true">
        <PreviewImage src={images.portrait} />
        <div>
          <h3>Nora Winslow Keene</h3>
          <p>I am a dedicated public interest attorney based in Denver.</p>
          <span>X Instagram WhatsApp</span>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-page-link-bio-tight') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-link-tight" aria-hidden="true">
        <PreviewImage src={images.hero} />
        <p>I am Asahachi Kono, a Japanese photographer and photo retoucher.</p>
      </div>
    );
  }

  if (kind === 'tt5-page-portfolio-home') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-portfolio" aria-hidden="true">
        <h3>My name is Anna Moller and these are some of my photo projects.</h3>
        <div className="tt5-page-query-grid">
          <span className="is-large" />
          <span>No results found.</span>
          <span>Hello world!</span>
          <span>No results found.</span>
        </div>
      </div>
    );
  }

  if (kind === 'tt5-page-shop-home') {
    return (
      <div className="tt5-pattern-preview tt5-pattern-preview--page tt5-pattern-preview--page-shop" aria-hidden="true">
        <section>
          <PreviewImage src={images.hero} />
          <div>
            <h3>New arrivals</h3>
            <p>Like flowers that bloom in unexpected places.</p>
            <ButtonPill>Learn more</ButtonPill>
          </div>
        </section>
        <section>
          <h3>Top Categories</h3>
          {[images.anthuriums, images.cactus, images.sunflowers].map((image, index) => (
            <PreviewImage key={index} src={image} />
          ))}
        </section>
      </div>
    );
  }

  return null;
}

export default TT5PatternPreview;
