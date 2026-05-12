/**
 * Front-of-site chrome: mirrors a block theme template framing
 * (header template part + main + footer template part).
 *
 * @typedef {{
 *   key: string,
 *   label: string,
 *   kind?: 'page',
 *   page: object,
 * } | {
 *   key: string,
 *   label: string,
 *   kind: 'url',
 *   href: string,
 * }} NavEntry
 */

/**
 * Sitename + primary nav (inside `.p-header` or alone for editor header row).
 */
export function PreviewSiteNavCluster({ siteTitle, navEntries, onNavClick }) {
  return (
    <>
      <span className="p-sitename">{siteTitle}</span>
      <div className="p-nav">
        {navEntries.map((entry) => {
          const isUrl = entry.kind === 'url';
          return (
            <a
              key={entry.key}
              href="#"
              title={isUrl ? entry.href : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (!isUrl && entry.page) {
                  onNavClick(entry.page);
                }
              }}
            >
              {entry.label}
            </a>
          );
        })}
      </div>
    </>
  );
}

/** Header template part — site chrome above main content */
export function PreviewSiteChromeHeader({ siteTitle, navEntries, onNavClick }) {
  return (
    <div className="p-header">
      <PreviewSiteNavCluster
        siteTitle={siteTitle}
        navEntries={navEntries}
        onNavClick={onNavClick}
      />
    </div>
  );
}

/** Footer template part */
export function PreviewSiteChromeFooter({ siteTitle }) {
  return (
    <div className="p-footer">
      <span className="p-ft">© 2026 {siteTitle}</span>
      <span className="p-ft">Privacy Policy</span>
    </div>
  );
}

/**
 * Template shell: default header/footer around main preview content.
 * Optional overrides swap parts without duplicating markup.
 */
export function PreviewTemplateFrame({
  siteTitle,
  navEntries,
  onNavClick,
  children,
  header = null,
  footer = null,
}) {
  return (
    <>
      {header ?? (
        <PreviewSiteChromeHeader
          siteTitle={siteTitle}
          navEntries={navEntries}
          onNavClick={onNavClick}
        />
      )}
      {children}
      {footer ?? <PreviewSiteChromeFooter siteTitle={siteTitle} />}
    </>
  );
}
