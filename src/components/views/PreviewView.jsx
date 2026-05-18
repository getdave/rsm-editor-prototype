import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { Stack } from '@wordpress/ui';
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pages } = useAppState();
  const [previewMode, setPreviewMode] = useState('preview');

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit?inserter=patterns`);
  };

  const livePages = pages.filter((p) => p.status === 'live');

  return (
    <Stack direction="column" className="cs-stack">
      <div className="pages-panel show">
        <Page
          className="pages-panel__grid pages-content-frame preview-page"
          title={
            previewMode === 'preview'
              ? 'Live preview of your site'
              : 'Live pages of your site'
          }
          actions={
            <ToggleGroupControl
              __nextHasNoMarginBottom
              isBlock
              hideLabelFromVision
              label="Preview mode"
              value={previewMode}
              onChange={(value) => setPreviewMode(value)}
            >
              <ToggleGroupControlOption value="preview" label="Preview" />
              <ToggleGroupControlOption value="pages" label="Pages" />
            </ToggleGroupControl>
          }
          showSidebarToggle={false}
        >
          <div className="pp-inner pp-dataviews">
            <div className="dataviews-wrapper preview-dataviews-wrapper">
              {previewMode === 'preview' ? (
                <article className="preview-thumbnail">
                  <PreviewCanvas
                    page={currentPage}
                    onEdit={handleEdit}
                    onPageChange={setCurrentPage}
                  />
                </article>
              ) : (
                <ul className="preview-pages-index">
                  {livePages.map((page) => (
                    <li
                      key={page.id}
                      className="preview-pages-index-item"
                    >
                      <span className="preview-pages-index-name">
                        {page.name}
                      </span>
                      <span
                        className={`preview-pages-index-type preview-pages-index-type--${
                          page.category === 'collection' ? 'dynamic' : 'static'
                        }`}
                      >
                        {page.category === 'collection' ? 'Dynamic' : 'Static'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Page>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
