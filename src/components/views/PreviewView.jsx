import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { currentPage, setCurrentPage } = useAppState();
  const [previewMode, setPreviewMode] = useState('preview');

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit?inserter=patterns`);
  };

  return (
    <Stack direction="column" className="cs-stack">
      <div className="pages-panel preview-panel show">
        <header className="preview-panel-header">
          <h1 className="preview-panel-title">
            {previewMode === 'preview'
              ? 'Live preview of your site'
              : 'Live pages of your site'}
          </h1>
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
        </header>
        <div className="cs-stack-canvas preview-body">
          <div className="preview-body-canvas">
            <PreviewCanvas
              page={currentPage}
              onEdit={handleEdit}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
