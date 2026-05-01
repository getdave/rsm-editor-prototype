import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { check } from '@wordpress/icons';
import SplitViewLayout from '../../layouts/SplitViewLayout';
import PreviewCanvas from '../shared/PreviewCanvas';
import { pages, styleVariations } from '../../data/mockData';

function StylesView() {
  const navigate = useNavigate();
  const homePage = pages.find((p) => p.id === 'home') ?? pages[0];
  const [previewPage, setPreviewPage] = useState(homePage);
  const defaultVariation = styleVariations.find((v) => v.isDefault) ?? styleVariations[0];
  const [activeVariationId, setActiveVariationId] = useState(defaultVariation.id);
  const activeVariation = styleVariations.find((v) => v.id === activeVariationId);

  const stageContent = (
    <div className="pp-inner styles-view edit-site-layout__area">
      <div className="pp-hd">
        <span className="pp-title">Styles</span>
      </div>
      <ul className="styles-list">
        {styleVariations.map((v) => (
          <li
            key={v.id}
            className={`styles-list-item pp-tab ${v.id === activeVariationId ? 'on' : ''}`}
            onClick={() => setActiveVariationId(v.id)}
          >
            <span className="styles-swatches" aria-hidden="true">
              <span className="styles-swatch" style={{ background: v.colors.primary }} />
              <span className="styles-swatch" style={{ background: v.colors.secondary }} />
              <span className="styles-swatch" style={{ background: v.colors.accent }} />
            </span>
            <span className="styles-list-name">{v.name}</span>
            {v.id === activeVariationId && (
              <span aria-hidden="true">{check}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const canvasContent = (
    <div
      className="edit-site-layout__canvas-container"
      style={{
        '--variation-primary': activeVariation.colors.primary,
        '--variation-accent': activeVariation.colors.accent,
        '--variation-bg': activeVariation.colors.background,
        display: 'flex',
        flex: 1,
        minHeight: 0,
      }}
    >
      <PreviewCanvas
        page={previewPage}
        onEdit={() => navigate(`/pages/${previewPage.id}/edit`)}
        onPageChange={setPreviewPage}
      />
    </div>
  );

  return (
    <div className="pages-panel design-panel show">
      <SplitViewLayout
        mode="list"
        stageContent={stageContent}
        canvasContent={canvasContent}
      />
    </div>
  );
}

export default StylesView;
