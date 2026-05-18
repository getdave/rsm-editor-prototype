import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { Stack } from '@wordpress/ui';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import PageLayoutWireframeThumb from '../shared/PageLayoutWireframeThumb';
import ContentSuggestions from './ContentSuggestions';

const PAGES_INDEX_FIELDS = [
  {
    id: 'media',
    label: 'Thumbnail',
    enableSorting: false,
    enableHiding: false,
    filterBy: false,
    enableGlobalSearch: false,
    render: ({ item }) => {
      const className = [
        'pp-media-thumb',
        'pp-media-thumb--grid',
        item.isCollection ? 'pp-media-thumb--collection' : '',
        item.collectionState === 'inactive'
          ? 'pp-media-thumb--inactive'
          : '',
      ]
        .filter(Boolean)
        .join(' ');
      return (
        <span className={className}>
          <PageLayoutWireframeThumb page={item} />
          {item.isFrontPage ? (
            <span className="pp-front-page-overlay">Homepage</span>
          ) : item.collectionOverlay ? (
            <span className="pp-collection-marker-overlay">
              {item.collectionOverlay}
            </span>
          ) : item.isPostsPage ? (
            <span className="pp-posts-page-overlay">Posts page</span>
          ) : null}
        </span>
      );
    },
  },
  {
    id: 'name',
    type: 'text',
    label: 'Name',
    enableHiding: false,
    enableGlobalSearch: true,
  },
];

const PAGES_INDEX_DEFAULT_VIEW = {
  type: 'grid',
  search: '',
  filters: [],
  page: 1,
  perPage: 24,
  titleField: 'name',
  mediaField: 'media',
  fields: [],
  layout: { density: 'compact' },
};

const PAGES_INDEX_DEFAULT_LAYOUTS = {
  grid: {
    badgeFields: [],
    layout: { density: 'compact' },
  },
};

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pages } = useAppState();
  const [previewMode, setPreviewMode] = useState('preview');
  const [pagesIndexView, setPagesIndexView] = useState(
    PAGES_INDEX_DEFAULT_VIEW,
  );

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit?inserter=patterns`);
  };

  const livePages = useMemo(
    () => pages.filter((p) => p.status === 'live'),
    [pages],
  );

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(livePages, pagesIndexView, PAGES_INDEX_FIELDS),
    [livePages, pagesIndexView],
  );

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
            {previewMode === 'preview' ? (
              <div className="dataviews-wrapper preview-dataviews-wrapper">
                <article className="preview-thumbnail">
                  <PreviewCanvas
                    page={currentPage}
                    onEdit={handleEdit}
                    onPageChange={setCurrentPage}
                  />
                </article>
              </div>
            ) : (
              <DataViews
                data={processedData}
                fields={PAGES_INDEX_FIELDS}
                view={pagesIndexView}
                onChangeView={setPagesIndexView}
                defaultLayouts={PAGES_INDEX_DEFAULT_LAYOUTS}
                paginationInfo={paginationInfo}
                actions={[]}
                getItemId={(item) => item.id}
                isItemClickable={() => true}
                onClickItem={(item) => {
                  setCurrentPage(item);
                  navigate(
                    `/pages/${item.id}/edit?inserter=patterns`,
                  );
                }}
              >
                <div className="pp-dv-scroll">
                  <DataViews.Layout />
                  <DataViews.Pagination />
                </div>
              </DataViews>
            )}
          </div>
        </Page>
      </div>
      <ContentSuggestions />
    </Stack>
  );
}

export default PreviewView;
