import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
import { settings as settingsIcon } from '@wordpress/icons';
import StylesPanelHeader from './StylesPanelHeader';
import { typographyVariations, typographyElements } from '../../../data/mockData';

/**
 * Mirrors Gutenberg's /styles/typography panel:
 *   - Description paragraph
 *   - TYPESETS: 3-column grid of large "Aa" tiles
 *   - FONTS: boxed list of installed font families with variant counts;
 *     section label has a filter/settings icon on the right
 *   - ELEMENTS: boxed list of element rows (Aa preview + name)
 *   - FONT SIZES: single boxed row "Font size presets" + chevron
 */
function TypographyPanel() {
  // First typeset gets the active treatment.
  const activeTypeset = typographyVariations[0]?.id;

  return (
    <div className="styles-panel">
      <StylesPanelHeader title="Typography" />

      <Text variant="body-sm" className="styles-panel-description">
        Available fonts, typographic styles, and the application of those
        styles.
      </Text>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Typesets
        </Text>
        <div className="styles-typo-grid">
          {typographyVariations.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`styles-typo-tile ${
                t.id === activeTypeset ? 'is-active' : ''
              }`}
              aria-label={t.name}
            >
              <span
                className="styles-typo-aa"
                style={{ fontFamily: t.headingFont }}
              >
                Aa
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="styles-panel-section">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-section-label"
        >
          <Text variant="body-sm">Fonts</Text>
          <Button
            icon={settingsIcon}
            label="Font settings"
            iconSize={18}
            className="styles-panel-section-label-action"
          />
        </Stack>
        <Card.Root className="styles-section-card">
          <Card.Content className="styles-row styles-row-clickable">
            <Text
              variant="body-md"
              className="styles-row-name"
              style={{ fontFamily: 'monospace' }}
            >
              Fira Code
            </Text>
            <Text variant="body-sm" className="styles-row-meta">
              1 variant
            </Text>
          </Card.Content>
          <Card.Content className="styles-row styles-row-clickable">
            <Text variant="body-md" className="styles-row-name">
              Manrope
            </Text>
            <Text variant="body-sm" className="styles-row-meta">
              1 variant
            </Text>
          </Card.Content>
        </Card.Root>
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Elements
        </Text>
        <Card.Root className="styles-section-card">
          {typographyElements.map((item) => {
            // Per-element preview style: Links underlined, Buttons inverted.
            const isLink = item.slug === 'link';
            const isButton = item.slug === 'button';
            const aaStyle = {
              fontFamily: item.family,
              ...(isLink ? { textDecoration: 'underline' } : {}),
              ...(isButton
                ? {
                    background: '#1e1e1e',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '2px',
                  }
                : {}),
            };
            return (
              <Card.Content
                key={item.slug}
                className="styles-row styles-row-clickable"
              >
                <span className="styles-row-aa" style={aaStyle} aria-hidden="true">
                  Aa
                </span>
                <Text variant="body-md" className="styles-row-name">
                  {item.name}
                </Text>
              </Card.Content>
            );
          })}
        </Card.Root>
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Font sizes
        </Text>
        <Card.Root className="styles-section-card">
          <Card.Content className="styles-row styles-row-clickable">
            <Text variant="body-md" className="styles-row-name">
              Font size presets
            </Text>
            <span className="styles-row-chevron" aria-hidden="true">›</span>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}

export default TypographyPanel;
