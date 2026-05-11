import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SplitViewLayout from '../../layouts/SplitViewLayout';
import PreviewCanvas from '../shared/PreviewCanvas';
import { pages } from '../../data/mockData';

/**
 * StylesView is the layout for /design/styles/*. The middle "stage" area
 * renders one of the nested panel routes via <Outlet /> (variations, colors,
 * typography, background, shadows, layout). The canvas on the right keeps
 * the prototype's PreviewCanvas showing the home page.
 */
function StylesView() {
  const navigate = useNavigate();
  const homePage = pages.find((p) => p.id === 'home') ?? pages[0];
  const [previewPage, setPreviewPage] = useState(homePage);

  const stageContent = (
    <div className="pp-inner styles-view edit-site-layout__area">
      <Outlet />
    </div>
  );

  const canvasContent = (
    <div className="edit-site-layout__canvas-container styles-view-canvas">
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
