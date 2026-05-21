import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import {
  external,
  help,
  navigation,
  page as pageIcon,
  styles,
} from '@wordpress/icons';
import { useSpotlightHelp } from '../../hooks/useSpotlightHelp';

function ContentSuggestions() {
  const navigate = useNavigate();
  const { requestSpotlightHelp } = useSpotlightHelp();
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const handleAddPage = () => {
    navigate('/pages');
    requestSpotlightHelp({
      id: 'learn-basics-add-page',
      target: '[data-help-target="pages-add-page"]',
      title: 'Add pages from here',
      description:
        'Create a new page from a layout or a blank page. After you dismiss this, choose Add page to start.',
      persist: true,
    });
  };

  const handleNavigation = () => {
    navigate('/navigation', {
      state: { spotlightHelpTarget: 'navigation-add-to-menu' },
    });
    requestSpotlightHelp({
      id: 'learn-basics-navigation',
      target: '[data-help-target="navigation-add-to-menu"]',
      title: 'Add pages to your menu',
      description:
        'Use this control to choose which pages appear in the site menu.',
      persist: true,
    });
  };

  const handleDesign = () => {
    navigate('/design/styles');
    requestSpotlightHelp({
      id: 'learn-basics-design',
      target: '[data-help-target="styles-variations-grid"]',
      title: 'Start with a style variation',
      description:
        'Style variations change the overall look of the site first. More specific colors, fonts, and layout controls stay nearby when you need them.',
      persist: true,
    });
  };

  const suggestions = [
    {
      id: 'add-page',
      title: 'Add a new page',
      description: 'Create a page from a layout or blank page.',
      icon: pageIcon,
      tone: 'page',
      onClick: handleAddPage,
    },
    {
      id: 'navigation',
      title: 'Set up navigation',
      description: 'Choose which pages appear in your main menu.',
      icon: navigation,
      tone: 'navigation',
      onClick: handleNavigation,
    },
    {
      id: 'design',
      title: 'Change your site design',
      description: 'Update colors, fonts, and style variations.',
      icon: styles,
      tone: 'design',
      onClick: handleDesign,
    },
  ];

  if (dismissed) return null;

  return (
    <section className={`cs-area ${expanded ? '' : 'collapsed'}`}>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="cs-head"
      >
        {expanded ? (
          <Text variant="body-md" className="cs-title">
            Learn the basics
          </Text>
        ) : (
          <button
            type="button"
            className="cs-title cs-title-button"
            onClick={() => setExpanded(true)}
          >
            Learn the basics
          </button>
        )}
        <Stack direction="row" align="center" gap="md" className="cs-actions">
          <Button variant="link" className="cs-action" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide' : 'Show'}
          </Button>
          <Button variant="link" className="cs-action" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
        </Stack>
      </Stack>
      {expanded && (
        <>
          <div className="cs-banners">
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                className={`cs-banner cs-banner--${s.tone}`}
                onClick={s.onClick}
              >
                <div className="cs-banner-visual" aria-hidden="true">
                  <div className="cs-banner-preview">
                    {s.tone === 'page' && (
                      <span className="cs-page-preview">
                        <span className="cs-page-plus">+</span>
                        <span className="cs-page-line cs-page-line--title" />
                        <span className="cs-page-block" />
                        <span className="cs-page-line" />
                        <span className="cs-page-line cs-page-line--short" />
                      </span>
                    )}
                    {s.tone === 'navigation' && (
                      <span className="cs-nav-preview">
                        <span className="cs-nav-row is-active" />
                        <span className="cs-nav-row" />
                        <span className="cs-nav-row" />
                        <span className="cs-nav-route" />
                      </span>
                    )}
                    {s.tone === 'design' && (
                      <span className="cs-design-preview">
                        <span className="cs-design-aa">Aa</span>
                        <span className="cs-design-swatches">
                          <span />
                          <span />
                          <span />
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="cs-banner-copy">
                  <span className="cs-banner-title-row">
                    <span className="cs-banner-icon" aria-hidden="true">{s.icon}</span>
                    <Text variant="body-md" className="cs-banner-title">
                      {s.title}
                    </Text>
                  </span>
                  <Text variant="body-sm" className="cs-banner-description">
                    {s.description}
                  </Text>
                </div>
              </button>
            ))}
          </div>
          <a
            className="cs-learn-link"
            href="https://learn.wordpress.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cs-learn-link-icon" aria-hidden="true">{help}</span>
            <span>Explore Learn WordPress resources</span>
            <span className="cs-learn-link-external" aria-hidden="true">{external}</span>
          </a>
        </>
      )}
    </section>
  );
}

export default ContentSuggestions;
