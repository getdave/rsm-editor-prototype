import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { Stack, Text } from '@wordpress/ui';
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
      <div className="pages-panel show">
        <Page
          className="pages-panel__grid pages-content-frame preview-page"
          title={
            <Text variant="heading-xl">
              {previewMode === 'preview'
                ? 'Live preview of your site'
                : 'Live pages of your site'}
            </Text>
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
          <PreviewCanvas
            page={currentPage}
            onEdit={handleEdit}
            onPageChange={setCurrentPage}
          />
        </Page>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
