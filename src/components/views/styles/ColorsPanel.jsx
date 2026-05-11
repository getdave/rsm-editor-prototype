import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
import { moreVertical } from '@wordpress/icons';
import StylesPanelHeader from './StylesPanelHeader';
import { themePalette, colorElements } from '../../../data/mockData';

/**
 * Mirrors Gutenberg's /styles/colors panel:
 *   - Description paragraph
 *   - PALETTE section: a single boxed row showing stacked color circles +
 *     "Edit palette" + chevron (drills into palette editor in the real UI)
 *   - "Elements" sentence-case heading with a 3-dot menu
 *   - Boxed list of element rows (Text, Background, Link, Captions, Button,
 *     Heading) — each row has a color swatch on the left
 */
function ColorsPanel() {
  // First 4 palette colors used for the stacked-circles preview.
  const stackPreview = themePalette.slice(0, 4);

  return (
    <div className="styles-panel">
      <StylesPanelHeader title="Colors" />

      <Text variant="body-sm" className="styles-panel-description">
        Palette colors and the application of those colors on site elements.
      </Text>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Palette
        </Text>
        <Card.Root className="styles-section-card">
          <Card.Content className="styles-row styles-row-clickable">
            <span className="styles-color-stack" aria-hidden="true">
              {stackPreview.map((p) => (
                <span
                  key={p.slug}
                  className="styles-color-stack-circle"
                  style={{ background: p.color }}
                />
              ))}
            </span>
            <Text variant="body-md" className="styles-row-name">
              Edit palette
            </Text>
            <span className="styles-row-chevron" aria-hidden="true">›</span>
          </Card.Content>
        </Card.Root>
      </div>

      <div className="styles-panel-section">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-heading-row"
        >
          <Text variant="heading-sm" className="styles-panel-heading">
            Elements
          </Text>
          <Button
            icon={moreVertical}
            label="Element options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </Stack>
        <Card.Root className="styles-section-card">
          {colorElements.map((item) => (
            <Card.Content
              key={item.slug}
              className="styles-row styles-row-clickable"
            >
              <span
                className="styles-row-swatch"
                style={{
                  background: item.color,
                  borderRadius: '50%',
                }}
                aria-hidden="true"
              />
              <Text variant="body-md" className="styles-row-name">
                {item.name}
              </Text>
            </Card.Content>
          ))}
        </Card.Root>
      </div>
    </div>
  );
}

export default ColorsPanel;
