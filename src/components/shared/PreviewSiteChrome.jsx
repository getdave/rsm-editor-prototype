import { useState } from 'react';
import { chevronDown, menu } from '@wordpress/icons';

/**
 * Front-of-site chrome: mirrors a block theme template framing
 * (header template part + main + footer template part).
 *
 * @typedef {{
 *   key: string,
 *   label: string,
 *   kind?: 'page',
 *   page: object,
 *   children?: NavEntry[],
 * } | {
 *   key: string,
 *   label: string,
 *   kind: 'url',
 *   href: string,
 *   children?: NavEntry[],
 * } | {
 *   key: string,
 *   label: string,
 *   kind: 'label',
 *   children?: NavEntry[],
 * }} NavEntry
 */

function NavEntryControl({ entry, onNavClick, className, onNavigate }) {
  const isUrl = entry.kind === 'url';

  if (entry.kind === 'label') {
    return <span className={className || 'p-nav-label'}>{entry.label}</span>;
  }

  return (
    <a
      className={className}
      href="#"
      title={isUrl ? entry.href : undefined}
      onClick={(e) => {
        e.preventDefault();
        if (!isUrl && entry.page) {
          onNavClick(entry.page);
        }
        onNavigate?.();
      }}
    >
      {entry.label}
    </a>
  );
}

function MobileNavEntry({ entry, onNavClick, onNavigate, isChild = false }) {
  const children = entry.children || [];

  return (
    <div className={`p-mobile-nav-item${isChild ? ' is-child' : ''}`}>
      <NavEntryControl
        entry={entry}
        onNavClick={onNavClick}
        onNavigate={onNavigate}
        className={entry.kind === 'label' ? 'p-mobile-nav-label' : 'p-mobile-nav-link'}
      />
      {children.length ? (
        <div className="p-mobile-subnav">
          {children.map((child) => (
            <MobileNavEntry
              key={child.key}
              entry={child}
              onNavClick={onNavClick}
              onNavigate={onNavigate}
              isChild
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Sitename + primary nav (inside `.p-header` or alone for editor header row).
 */
export function PreviewSiteNavCluster({
  siteTitle,
  navEntries,
  onNavClick,
  mobileMenuInteractive = true,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <span className="p-sitename">{siteTitle}</span>
      <div className="p-nav">
        {navEntries.map((entry) => {
          const children = entry.children || [];
          const hasChildren = children.length > 0;
          return (
            <div
              key={entry.key}
              className={`p-nav-item${hasChildren ? ' has-children' : ''}`}
            >
              <NavEntryControl entry={entry} onNavClick={onNavClick} />
              {hasChildren ? (
                <span className="p-nav-dropdown-indicator" aria-hidden="true">
                  {chevronDown}
                </span>
              ) : null}
              {hasChildren ? (
                <div className="p-subnav">
                  {children.map((child) => (
                    <NavEntryControl
                      key={child.key}
                      entry={child}
                      onNavClick={onNavClick}
                      className="p-subnav-link"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="p-mobile-nav">
        {mobileMenuInteractive ? (
          <button
            type="button"
            className="p-mobile-nav-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {menu}
          </button>
        ) : (
          <span
            className="p-mobile-nav-toggle p-mobile-nav-toggle--static"
            aria-hidden="true"
          >
            {menu}
          </span>
        )}
        {mobileMenuInteractive && mobileMenuOpen ? (
          <div className="p-mobile-nav-overlay" aria-label="Navigation menu">
            {navEntries.map((entry) => (
              <MobileNavEntry
                key={entry.key}
                entry={entry}
                onNavClick={onNavClick}
                onNavigate={closeMobileMenu}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

/** Header template part — site chrome above main content */
export function PreviewSiteChromeHeader({
  siteTitle,
  navEntries,
  onNavClick,
}) {
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
export function PreviewSiteChromeFooter({
  siteTitle,
  navEntries,
  onNavClick,
}) {
  return (
    <div className="p-footer">
      <span className="p-ft p-footer-copyright">© 2026 {siteTitle}</span>
      <nav className="p-footer-nav" aria-label="Footer navigation">
        {navEntries.map((entry) => (
          <NavEntryControl
            key={entry.key}
            entry={entry}
            onNavClick={onNavClick}
            className="p-footer-nav-link"
          />
        ))}
      </nav>
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
      {footer ?? (
        <PreviewSiteChromeFooter
          siteTitle={siteTitle}
          navEntries={navEntries}
          onNavClick={onNavClick}
        />
      )}
    </>
  );
}
