import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SplitViewLayout from '../../layouts/SplitViewLayout';
import { useAppState } from '../../hooks/useAppState';
import { resolveHomepagePreviewTarget } from '../../utils/homepagePreviewTarget';
import PreviewCanvas from '../shared/PreviewCanvas';

/**
 * StylesView is the layout for /design/styles/*. The middle "stage" area
 * renders one of the nested panel routes via <Outlet /> (variations, colors,
 * typography, background, shadows, layout). The canvas on the right keeps
 * the prototype's PreviewCanvas showing the home page.
 */
function StylesView() {
  const navigate = useNavigate();
  const {
    currentPage,
    frontPageId,
    homepageDisplayMode,
    pageDesigns,
    pages,
  } = useAppState();
  const resolvedHome = useMemo(
    () =>
      resolveHomepagePreviewTarget({
        homepageDisplayMode,
        frontPageId,
        pages,
        pageDesigns,
        currentPage,
      }),
    [currentPage, frontPageId, homepageDisplayMode, pageDesigns, pages],
  );
  const resolvedHomeKey = resolvedHome?.id ?? null;
  const [previewOverride, setPreviewOverride] = useState(null);
  const previewPage =
    previewOverride?.homeKey === resolvedHomeKey && previewOverride.target
      ? previewOverride.target
      : resolvedHome;

  const handlePreviewPageChange = (page) => {
    setPreviewOverride({ homeKey: resolvedHomeKey, target: page });
  };

  const handleEdit = () => {
    if (!previewPage) return;
    if (previewPage.isPageDesign) {
      navigate(`/page-designs/${previewPage.id}/edit`);
      return;
    }
    navigate(`/pages/${previewPage.id}/edit`);
  };

  const stageContent = (
    <div className="pp-inner styles-view edit-site-layout__area">
      <Outlet />
    </div>
  );

  const canvasContent = (
    <div className="edit-site-layout__canvas-container styles-view-canvas">
      <PreviewCanvas
        page={previewPage}
        onEdit={handleEdit}
        onPageChange={handlePreviewPageChange}
        documentLabel={previewPage?.previewLabel}
        scopeNotice={previewPage?.isPageDesign ? previewPage.scopeNotice : undefined}
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
