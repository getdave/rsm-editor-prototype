import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { navigation, page as pageIcon, styles } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

function ContentSuggestions() {
  const navigate = useNavigate();
  const { openAddPageModal } = useAppState();
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const suggestions = [
    {
      id: 'add-page',
      title: 'Add a new page',
      description: 'Create a page from a layout or blank page.',
      cta: 'Add page',
      icon: pageIcon,
      tone: 'page',
      onClick: openAddPageModal,
    },
    {
      id: 'navigation',
      title: 'Set up navigation',
      description: 'Choose which pages appear in your main menu.',
      cta: 'Set up menu',
      icon: navigation,
      tone: 'navigation',
      onClick: () => navigate('/navigation'),
    },
    {
      id: 'design',
      title: 'Change your site design',
      description: 'Update colors, typography, and style variations.',
      cta: 'Change design',
      icon: styles,
      tone: 'design',
      onClick: () => navigate('/design/styles'),
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
        <Text variant="body-md" className="cs-title">
          Learn the basics
        </Text>
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
        <div className="cs-banners">
          {suggestions.map(s => (
            <button
              key={s.id}
              type="button"
              className={`cs-banner cs-banner--${s.tone}`}
              onClick={s.onClick}
            >
              <div className="cs-banner-visual" aria-hidden="true">
                <span className="cs-banner-icon">{s.icon}</span>
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
                <Text variant="body-md" className="cs-banner-title">
                  {s.title}
                </Text>
                <Text variant="body-sm" className="cs-banner-description">
                  {s.description}
                </Text>
                <span className="cs-banner-cta">{s.cta}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default ContentSuggestions;
