import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Text } from '@wordpress/ui';
import {
  calendar,
  chevronRight,
  postList,
  store,
} from '@wordpress/icons';
import {
  contentRecords,
  contentTypes,
} from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import { resolveHomepagePreviewTarget } from '../../utils/homepagePreviewTarget';
import { showPrototypeNotImplementedAlert } from '../../utils/prototypeNotImplemented';
import PreviewCanvas from '../shared/PreviewCanvas';
import PrototypeNotImplementedButton from '../shared/PrototypeNotImplemented';

const CONTENT_TYPE_ICONS = {
  posts: postList,
  products: store,
  events: calendar,
  calendar,
};

const RECORD_STATUS_ELEMENTS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const POST_AUTHOR_ELEMENTS = [
  { value: 'Avery Stone', label: 'Avery Stone' },
  { value: 'Maya Chen', label: 'Maya Chen' },
];

const POST_CATEGORY_ELEMENTS = [
  { value: 'Guides', label: 'Guides' },
  { value: 'Behind the Scenes', label: 'Behind the Scenes' },
  { value: 'Client Stories', label: 'Client Stories' },
  { value: 'Studio News', label: 'Studio News' },
  { value: 'Locations', label: 'Locations' },
];

const POST_TAG_ELEMENTS = [
  { value: 'Portraits', label: 'Portraits' },
  { value: 'Weddings', label: 'Weddings' },
  { value: 'Editing', label: 'Editing' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Prints', label: 'Prints' },
];

const PRODUCT_TYPE_ELEMENTS = [
  { value: 'simple', label: 'Simple product' },
  { value: 'variable', label: 'Variable product' },
];

const PRODUCT_CATEGORY_ELEMENTS = [
  { value: 'Sessions', label: 'Sessions' },
  { value: 'Wedding Packages', label: 'Wedding Packages' },
  { value: 'Prints', label: 'Prints' },
  { value: 'Gift Cards', label: 'Gift Cards' },
];

const PRODUCT_TAG_ELEMENTS = [
  { value: 'Portraits', label: 'Portraits' },
  { value: 'Weddings', label: 'Weddings' },
  { value: 'Family', label: 'Family' },
  { value: 'Limited Edition', label: 'Limited Edition' },
  { value: 'Digital', label: 'Digital' },
];

const STOCK_STATUS_ELEMENTS = [
  { value: 'instock', label: 'In stock' },
  { value: 'onbackorder', label: 'On backorder' },
  { value: 'outofstock', label: 'Out of stock' },
];

const RECORD_TABLE_FIELDS = {
  posts: ['author', 'categories', 'date', 'status'],
  products: ['sku', 'stockStatus', 'price', 'status'],
  events: ['eventDate', 'venue', 'organizer', 'status'],
};

function getElementLabel(elements, value) {
  return elements.find((element) => element.value === value)?.label || value;
}

function renderTitle({ item }) {
  return (
    <span className="content-record-title-cell">
      <button
        type="button"
        className="content-record-title-link"
        onClick={showPrototypeNotImplementedAlert}
      >
        {item.title}
      </button>
      {item.slug ? (
        <span className="content-record-slug">/{item.slug}</span>
      ) : null}
    </span>
  );
}

function renderStatus({ item }) {
  const label = getElementLabel(RECORD_STATUS_ELEMENTS, item.status);
  return (
    <span
      className={`content-status-badge content-status-badge--${item.status}`}
    >
      {label}
    </span>
  );
}

function renderTerms(terms) {
  if (!terms?.length) {
    return <span className="content-record-empty">-</span>;
  }

  return (
    <span className="content-term-list">
      {terms.map((term) => (
        <span key={term} className="content-term-chip">
          {term}
        </span>
      ))}
    </span>
  );
}

function renderStockStatus({ item }) {
  const label = getElementLabel(STOCK_STATUS_ELEMENTS, item.stockStatus);
  const quantity =
    typeof item.stockQuantity === 'number' ? ` (${item.stockQuantity})` : '';

  return (
    <span
      className={`content-stock-status content-stock-status--${item.stockStatus}`}
    >
      {label}
      {quantity}
    </span>
  );
}

const POST_RECORD_FIELDS = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
    enableGlobalSearch: true,
    enableHiding: false,
    render: renderTitle,
  },
  {
    id: 'author',
    type: 'text',
    label: 'Author',
    elements: POST_AUTHOR_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    enableGlobalSearch: true,
    render: ({ item }) => (
      <span className="content-record-muted">{item.author}</span>
    ),
  },
  {
    id: 'categories',
    type: 'array',
    label: 'Categories',
    elements: POST_CATEGORY_ELEMENTS,
    filterBy: { operators: ['isAny', 'isAll', 'isNone'] },
    enableGlobalSearch: true,
    render: ({ item }) => renderTerms(item.categories),
  },
  {
    id: 'tags',
    type: 'array',
    label: 'Tags',
    elements: POST_TAG_ELEMENTS,
    filterBy: { operators: ['isAny', 'isAll', 'isNone'] },
    enableGlobalSearch: true,
    render: ({ item }) => renderTerms(item.tags),
  },
  {
    id: 'comments',
    type: 'integer',
    label: 'Comments',
    render: ({ item }) => (
      <span className="content-record-count">{item.comments}</span>
    ),
  },
  {
    id: 'date',
    type: 'text',
    label: 'Date',
    getValue: ({ item }) => item.dateSortable,
    render: ({ item }) => (
      <span className="content-record-muted">{item.date}</span>
    ),
  },
  {
    id: 'status',
    type: 'text',
    label: 'Status',
    elements: RECORD_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: renderStatus,
  },
];

const PRODUCT_RECORD_FIELDS = [
  {
    id: 'title',
    type: 'text',
    label: 'Name',
    enableGlobalSearch: true,
    enableHiding: false,
    render: renderTitle,
  },
  {
    id: 'sku',
    type: 'text',
    label: 'SKU',
    enableGlobalSearch: true,
    render: ({ item }) => (
      <span className="content-record-code">{item.sku}</span>
    ),
  },
  {
    id: 'productType',
    type: 'text',
    label: 'Type',
    elements: PRODUCT_TYPE_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: ({ item }) => (
      <span className="content-record-muted">
        {getElementLabel(PRODUCT_TYPE_ELEMENTS, item.productType)}
      </span>
    ),
  },
  {
    id: 'stockStatus',
    type: 'text',
    label: 'Stock',
    elements: STOCK_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: renderStockStatus,
  },
  {
    id: 'price',
    type: 'number',
    label: 'Price',
    getValue: ({ item }) => item.priceAmount,
    render: ({ item }) => item.price,
  },
  {
    id: 'productCategories',
    type: 'array',
    label: 'Categories',
    elements: PRODUCT_CATEGORY_ELEMENTS,
    filterBy: { operators: ['isAny', 'isAll', 'isNone'] },
    enableGlobalSearch: true,
    render: ({ item }) => renderTerms(item.productCategories),
  },
  {
    id: 'productTags',
    type: 'array',
    label: 'Tags',
    elements: PRODUCT_TAG_ELEMENTS,
    filterBy: { operators: ['isAny', 'isAll', 'isNone'] },
    enableGlobalSearch: true,
    render: ({ item }) => renderTerms(item.productTags),
  },
  {
    id: 'date',
    type: 'text',
    label: 'Date',
    getValue: ({ item }) => item.dateSortable,
    render: ({ item }) => (
      <span className="content-record-muted">{item.date}</span>
    ),
  },
  {
    id: 'status',
    type: 'text',
    label: 'Status',
    elements: RECORD_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: renderStatus,
  },
];

const EVENT_RECORD_FIELDS = [
  {
    id: 'title',
    type: 'text',
    label: 'Title',
    enableGlobalSearch: true,
    enableHiding: false,
    render: renderTitle,
  },
  {
    id: 'eventDate',
    type: 'text',
    label: 'Event date',
    getValue: ({ item }) => item.dateSortable,
    render: ({ item }) => (
      <span className="content-record-muted">{item.eventDate}</span>
    ),
  },
  {
    id: 'venue',
    type: 'text',
    label: 'Venue',
    enableGlobalSearch: true,
    render: ({ item }) => (
      <span className="content-record-muted">{item.venue}</span>
    ),
  },
  {
    id: 'organizer',
    type: 'text',
    label: 'Organizer',
    enableGlobalSearch: true,
    render: ({ item }) => (
      <span className="content-record-muted">{item.organizer}</span>
    ),
  },
  {
    id: 'status',
    type: 'text',
    label: 'Status',
    elements: RECORD_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: renderStatus,
  },
];

function getRecordFields(contentTypeId) {
  if (contentTypeId === 'products') {
    return PRODUCT_RECORD_FIELDS;
  }
  if (contentTypeId === 'events') {
    return EVENT_RECORD_FIELDS;
  }
  return POST_RECORD_FIELDS;
}

function getRecordTableFields(contentTypeId) {
  return RECORD_TABLE_FIELDS[contentTypeId] || ['title', 'status'];
}

function ContentTypeRow({ contentType, onSelect }) {
  const icon =
    CONTENT_TYPE_ICONS[contentType.iconKey] ||
    CONTENT_TYPE_ICONS[contentType.id] ||
    postList;
  return (
    <button
      type="button"
      className="content-type-card"
      onClick={onSelect}
    >
      <span className="content-type-icon" aria-hidden>
        {icon}
      </span>
      <span className="content-type-copy">
        <Text variant="body-md" className="content-type-name">
          {contentType.name}
        </Text>
        <Text variant="body-sm" className="content-type-meta">
          {contentType.description}
        </Text>
      </span>
      <span className="content-type-count">
        {contentType.count}
      </span>
      <span className="content-type-chevron" aria-hidden>
        {chevronRight}
      </span>
    </button>
  );
}

function createRecordsView(contentTypeId) {
  return {
    type: 'table',
    search: '',
    filters: [],
    page: 1,
    perPage: 10,
    sort: undefined,
    titleField: 'title',
    fields: [...getRecordTableFields(contentTypeId)],
  };
}

function ContentRecordsDataView({ contentType }) {
  const recordFields = useMemo(
    () => getRecordFields(contentType.id),
    [contentType.id],
  );
  const defaultTableFields = useMemo(
    () => getRecordTableFields(contentType.id),
    [contentType.id],
  );
  const defaultLayouts = useMemo(
    () => ({
      table: { fields: [...defaultTableFields] },
    }),
    [defaultTableFields],
  );
  const [recordsView, setRecordsView] = useState(() =>
    createRecordsView(contentType.id),
  );
  const { data: processedRecords, paginationInfo } = useMemo(
    () =>
      filterSortAndPaginate(
        contentRecords[contentType.id] || [],
        recordsView,
        recordFields,
      ),
    [contentType.id, recordFields, recordsView],
  );

  return (
    <DataViews
      data={processedRecords}
      fields={recordFields}
      view={recordsView}
      onChangeView={(nextView) =>
        setRecordsView({
          ...nextView,
          type: 'table',
        })
      }
      defaultLayouts={defaultLayouts}
      paginationInfo={paginationInfo}
      getItemId={(item) => item.id}
    >
      <div className="content-records-toolbar">
        <DataViews.Search />
        <DataViews.FiltersToggle />
      </div>
      <div className="content-records-filters">
        <DataViews.FiltersToggled />
      </div>
      <div className="content-records-table">
        <DataViews.Layout />
        <DataViews.Pagination />
      </div>
    </DataViews>
  );
}

function ContentView() {
  const navigate = useNavigate();
  const { contentTypeId } = useParams();
  const {
    currentPage,
    frontPageId,
    homepageDisplayMode,
    pageDesigns,
    pages,
  } = useAppState();
  const selectedContentType = contentTypes.find(
    (type) => type.id === contentTypeId,
  );
  const isDrilldown = Boolean(contentTypeId && selectedContentType);

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

  const addRecordAction = isDrilldown ? (
    <PrototypeNotImplementedButton
      variant="primary"
    >
      Add {selectedContentType.singularName}
    </PrototypeNotImplementedButton>
  ) : undefined;

  const stageContent = isDrilldown ? (
    <Page
      className="content-stage-frame"
      breadcrumbs={
        <nav className="content-breadcrumbs" aria-label="Breadcrumbs">
          <button
            type="button"
            className="content-breadcrumb-link"
            onClick={() => navigate('/content')}
          >
            Content
          </button>
          <span className="content-breadcrumb-separator" aria-hidden>
            /
          </span>
          <Text variant="heading-lg" className="content-breadcrumb-current">
            {selectedContentType.name}
          </Text>
        </nav>
      }
      subTitle={selectedContentType.description}
      actions={addRecordAction}
      showSidebarToggle={false}
    >
      <div className="content-stage-inner content-stage-inner--drilldown">
        <section className="content-section content-records-section">
          <ContentRecordsDataView
            key={selectedContentType.id}
            contentType={selectedContentType}
          />
        </section>
      </div>
    </Page>
  ) : (
    <Page
      className="content-stage-frame"
      title="Content"
      subTitle="Choose a content type to manage its items."
      showSidebarToggle={false}
    >
      <div className="content-stage-inner">
        <div className="content-type-list">
          {contentTypes.map((contentType) => (
            <ContentTypeRow
              key={contentType.id}
              contentType={contentType}
              onSelect={() => navigate(`/content/${contentType.id}`)}
            />
          ))}
        </div>
      </div>
    </Page>
  );

  const showPreview = !isDrilldown;
  const canvasTarget = resolvedHome;
  const canvasContent = showPreview && canvasTarget ? (
    <PreviewCanvas
      page={canvasTarget}
      onEdit={() => {
        if (canvasTarget.isPageDesign) {
          navigate(`/page-designs/${canvasTarget.id}/edit?inserter=patterns`);
          return;
        }
        navigate(`/pages/${canvasTarget.id}/edit?inserter=patterns`);
      }}
      onPageChange={() => {}}
      editLabel="Edit"
      documentLabel={canvasTarget.previewLabel || 'Homepage'}
    />
  ) : null;

  return (
    <div className="content-panel show">
      <div
        className={`split-view list content-split${showPreview ? '' : ' content-split--full'}`}
      >
        <div className="split-view-stage content-stage">{stageContent}</div>
        {showPreview ? (
          <div
            className="split-view-canvas content-preview-frame"
            role="region"
            aria-label="Preview"
          >
            {canvasContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ContentView;
