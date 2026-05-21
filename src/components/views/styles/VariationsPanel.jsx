import { useState } from 'react';
import { Text } from '@wordpress/ui';
import StylesPanelHeader from './StylesPanelHeader';
import {
  styleVariations,
  colorVariations,
  typographyVariations,
} from '../../../data/mockData';

const STYLE_CHANGE_NOT_IMPLEMENTED_MESSAGE =
  "Changing styles isn't implemented in this prototype.";

function showStyleChangeNotImplementedAlert() {
  window.alert(STYLE_CHANGE_NOT_IMPLEMENTED_MESSAGE);
}

/**
 * A single variation tile: large "Aa" preview with two color dots, used in
 * both the main variations grid and the Typography section.
 */
function VariationTile({ variation, isActive, onClick, showColors = true }) {
  const headingFont = variation.typography?.headingFont || 'inherit';
  const swatchPrimary = variation.colors?.primary || '#1e1e1e';
  const swatchSecondary =
    variation.colors?.accent || variation.colors?.secondary || '#888';
  const bg = variation.colors?.background || '#ffffff';
  const text = variation.colors?.secondary || variation.colors?.primary || '#1e1e1e';

  return (
    <button
      type="button"
      className={`styles-variation-tile ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      style={{ background: bg, color: text }}
      aria-label={variation.name}
    >
      <span className="styles-variation-aa" style={{ fontFamily: headingFont }}>
        Aa
      </span>
      {showColors && (
        <span className="styles-variation-dots" aria-hidden="true">
          <span
            className="styles-variation-dot"
            style={{ background: swatchPrimary }}
          />
          <span
            className="styles-variation-dot"
            style={{ background: swatchSecondary }}
          />
        </span>
      )}
    </button>
  );
}

/**
 * A color-palette tile shown in the COLOR VARIATIONS section: 4 horizontal
 * color bars side-by-side.
 */
function ColorPaletteTile({ palette, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`styles-color-tile ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label={palette.name}
    >
      {palette.colors.map((c, idx) => (
        <span key={idx} className="styles-color-bar" style={{ background: c }} />
      ))}
    </button>
  );
}

function VariationsPanel() {
  const defaultVariation = styleVariations.find((v) => v.isDefault) ?? styleVariations[0];
  const [activeVariationId] = useState(defaultVariation.id);
  const [activeColorId] = useState(colorVariations[0].id);
  const [activeTypoId] = useState(typographyVariations[0].id);
  const handleUnavailableStyleChange = () => {
    showStyleChangeNotImplementedAlert();
  };

  return (
    <div className="styles-panel">
      <StylesPanelHeader subtitle="Browse styles" />

      <Text variant="body-sm" className="styles-panel-description">
        Choose a variation to change the look of the site.
      </Text>

      <div className="styles-variation-grid">
        {styleVariations.map((v) => (
          <VariationTile
            key={v.id}
            variation={v}
            isActive={v.id === activeVariationId}
            onClick={handleUnavailableStyleChange}
          />
        ))}
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Color variations
        </Text>
        <div className="styles-color-grid">
          {colorVariations.map((p) => (
            <ColorPaletteTile
              key={p.id}
              palette={p}
              isActive={p.id === activeColorId}
              onClick={handleUnavailableStyleChange}
            />
          ))}
        </div>
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Typography
        </Text>
        <div className="styles-typo-grid">
          {typographyVariations.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`styles-typo-tile ${
                t.id === activeTypoId ? 'is-active' : ''
              }`}
              onClick={handleUnavailableStyleChange}
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
    </div>
  );
}

export default VariationsPanel;
