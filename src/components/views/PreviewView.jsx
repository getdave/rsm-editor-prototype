import { useCallback, useMemo, useState } from 'react';
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
  const [previewHistory, setPreviewHistory] = useState({
    entries: [],
    index: -1,
  });
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
    setPreviewHistory((prev) => {
      const currentEntry = previewTarget
        ? {
            homeKey: resolvedHomeKey,
            resetKey,
            target: previewTarget,
          }
        : null;
      const nextEntry = {
        homeKey: resolvedHomeKey,
        resetKey,
        target: page,
      };
      const baseEntries =
        prev.index >= 0 ? prev.entries.slice(0, prev.index + 1) : prev.entries;
      const currentTail = baseEntries[baseEntries.length - 1];
      const entries =
        currentEntry && currentTail?.target?.id !== currentEntry.target.id
          ? [...baseEntries, currentEntry, nextEntry]
          : [...baseEntries, nextEntry];
      return {
        entries,
        index: entries.length - 1,
      };
    });
    setCurrentPage(page);
  };

  const handlePreviewHistoryChange = useCallback(
    (nextIndex) => {
      const entry = previewHistory.entries[nextIndex];
      if (!entry) return;
      setPreviewHistory((prev) => ({
        ...prev,
        index: nextIndex,
      }));
      setPreviewOverride(entry);
      setCurrentPage(entry.target);
    },
    [previewHistory.entries, setCurrentPage],
  );

  const documentOptions = useMemo(
    () =>
      previewTarget?.id === resolvedHomeKey
        ? [
            {
              label: 'Configure Homepage',
              icon: settings,
              onClick: openConfigureHomepageModal,
            },
          ]
        : [],
    [openConfigureHomepageModal, previewTarget?.id, resolvedHomeKey],
  );

  const previewHistoryControls = useMemo(
    () => ({
      canGoBack: previewHistory.index > 0,
      canGoForward:
        previewHistory.index >= 0 &&
        previewHistory.index < previewHistory.entries.length - 1,
      onBack: () => handlePreviewHistoryChange(previewHistory.index - 1),
      onForward: () => handlePreviewHistoryChange(previewHistory.index + 1),
    }),
    [handlePreviewHistoryChange, previewHistory],
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
            previewHistory={previewHistoryControls}
            scopeNotice={previewTarget?.isPageDesign ? previewTarget.scopeNotice : undefined}
          />
        </div>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
