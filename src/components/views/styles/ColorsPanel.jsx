import { Button } from '@wordpress/components';
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

      <p className="styles-panel-description">
        Palette colors and the application of those colors on site elements.
      </p>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">Palette</div>
        <div className="styles-section-card">
          <div className="styles-row styles-row-clickable">
            <span className="styles-color-stack" aria-hidden="true">
              {stackPreview.map((p) => (
                <span
                  key={p.slug}
                  className="styles-color-stack-circle"
                  style={{ background: p.color }}
                />
              ))}
            </span>
            <span className="styles-row-name">Edit palette</span>
            <span className="styles-row-chevron" aria-hidden="true">›</span>
          </div>
        </div>
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-heading-row">
          <h3 className="styles-panel-heading">Elements</h3>
          <Button
            icon={moreVertical}
            label="Element options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </div>
        <div className="styles-section-card">
          {colorElements.map((item) => (
            <div key={item.slug} className="styles-row styles-row-clickable">
              <span
                className="styles-row-swatch"
                style={{
                  background: item.color,
                  borderRadius: '50%',
                }}
                aria-hidden="true"
              />
              <span className="styles-row-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ColorsPanel;
