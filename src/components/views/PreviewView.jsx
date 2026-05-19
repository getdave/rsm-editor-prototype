import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { settings } from '@wordpress/icons';
import { Stack } from '@wordpress/ui';
import { useAppState } from '../../hooks/useAppState';
import { resolveHomepagePreviewTarget } from '../../utils/homepagePreviewTarget';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentPage,
    frontPageId,
    homepageDisplayMode,
    pageDesigns,
    pages,
    openConfigureHomepageModal,
    selectPage,
    setCurrentPage,
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
  const resetKey = location.key;
  const [previewOverride, setPreviewOverride] = useState(null);
  const previewTarget =
    previewOverride?.resetKey === resetKey &&
    previewOverride.homeKey === resolvedHomeKey &&
    previewOverride.target
      ? previewOverride.target
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
    setPreviewOverride({ resetKey, homeKey: resolvedHomeKey, target: page });
    setCurrentPage(page);
  };

  const documentOptions = useMemo(
    () => [
      {
        label: 'Configure Homepage',
        icon: settings,
        onClick: openConfigureHomepageModal,
      },
    ],
    [openConfigureHomepageModal],
  );

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
            documentOptions={documentOptions}
            scopeNotice={previewTarget?.isPageDesign ? previewTarget.scopeNotice : undefined}
          />
        </div>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
