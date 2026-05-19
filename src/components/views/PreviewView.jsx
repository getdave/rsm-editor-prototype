import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@wordpress/ui';
import { useAppState } from '../../hooks/useAppState';
import { HOMEPAGE_DISPLAY_LATEST } from '../../data/mockData';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const navigate = useNavigate();
  const {
    currentPage,
    frontPageId,
    homepageDisplayMode,
    pageDesigns,
    pages,
    selectPage,
    setCurrentPage,
  } = useAppState();

  const resolvedHome = useMemo(() => {
    if (homepageDisplayMode === HOMEPAGE_DISPLAY_LATEST) {
      return pageDesigns.find((design) => design.id === 'blog-home-root');
    }
    return pages.find((page) => page.id === frontPageId) || currentPage;
  }, [currentPage, frontPageId, homepageDisplayMode, pageDesigns, pages]);

  const resolvedHomeKey = resolvedHome?.id ?? null;
  const [previewState, setPreviewState] = useState({
    homeKey: resolvedHomeKey,
    target: resolvedHome,
  });
  const previewTarget =
    previewState.homeKey === resolvedHomeKey && previewState.target
      ? previewState.target
      : resolvedHome;

  const handleEdit = () => {
    if (!previewTarget) return;
    if (previewTarget.isPageDesign) {
      navigate(`/page-designs/${previewTarget.id}/edit?inserter=patterns`);
      return;
    }
    selectPage(previewTarget);
    navigate(`/pages/${previewTarget.id}/edit?inserter=patterns`);
  };

  const handlePageChange = (page) => {
    setPreviewState({ homeKey: resolvedHomeKey, target: page });
    setCurrentPage(page);
  };

  return (
    <Stack direction="column" className="cs-stack">
      <div className="cs-stack-canvas preview-body">
        <div className="preview-body-canvas">
          <PreviewCanvas
            page={previewTarget}
            onEdit={handleEdit}
            onPageChange={handlePageChange}
            editLabel="Edit"
            documentLabel={previewTarget?.previewLabel}
            scopeNotice={previewTarget?.isPageDesign ? previewTarget.scopeNotice : undefined}
          />
        </div>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
