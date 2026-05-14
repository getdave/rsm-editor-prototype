import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { Button, Modal } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Text } from '@wordpress/ui';
import {
  calendar,
  chevronRight,
  grid,
  page as pageIcon,
  postList,
  store,
  styles,
} from '@wordpress/icons';
import {
  contentRecords,
  contentTypes,
  HOMEPAGE_DISPLAY_LATEST,
} from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import { showPrototypeNotImplementedAlert } from '../../utils/prototypeNotImplemented';
import PreviewCanvas from '../shared/PreviewCanvas';
import PrototypeNotImplementedButton from '../shared/PrototypeNotImplemented';

const CONTENT_TYPE_ICONS = {
  posts: postList,
  products: store,
  events: calendar,
  calendar,
};

const PAGE_DESIGN_ICONS = {
  listing: grid,
  single: pageIcon,
};

const TEMPLATE_STATE_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
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

function getTemplateScopeLabel(contentType, { capitalize = false } = {}) {
  const contentTypeLabel = capitalize
    ? contentType.singularName
    : contentType.singularName.toLowerCase();
  return `${contentTypeLabel} templates`;
}

function getTemplateState(design) {
  return design?.templateState === 'inactive' ? 'inactive' : 'active';
}

function isInactiveTemplate(design) {
  return getTemplateState(design) === 'inactive';
}

function getTemplateStateLabel(design) {
  return TEMPLATE_STATE_LABELS[getTemplateState(design)];
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

function PageDesignCard({
  design,
  isSelected,
  onCustomize,
  onSelect,
}) {
  const icon = PAGE_DESIGN_ICONS[design.layoutKind] || styles;
  const templateState = getTemplateState(design);
  const templateStateLabel = getTemplateStateLabel(design);
  const isInactive = templateState === 'inactive';
  return (
    <div
      className={`page-design-card${isSelected ? ' is-selected' : ''}${isInactive ? ' is-inactive' : ''}`}
    >
      <button
        type="button"
        className="page-design-card-main"
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        <span className="page-design-card-icon" aria-hidden>
          {icon}
        </span>
        <span className="page-design-card-copy">
          <span className="page-design-card-header">
            <Text variant="body-md" className="page-design-card-title">
              {design.shortName}
            </Text>
            <span
              className="page-design-card-status"
              aria-label={`Status: ${templateStateLabel}`}
            >
              <span className={`page-design-card-status-badge is-${templateState}`}>
                {templateStateLabel}
              </span>
            </span>
          </span>
          <Text variant="body-sm" className="page-design-card-desc">
            {design.description}
          </Text>
        </span>
      </button>
      {isInactive ? (
        <span className="page-design-card-action">
          <Button variant="secondary" onClick={onCustomize}>
            Customize
          </Button>
        </span>
      ) : null}
    </div>
  );
}

function CustomizeTemplateModal({
  contentType,
  design,
  onClose,
  onCustomizeTemplate,
}) {
  if (!design) {
    return null;
  }

  const layoutKind =
    design.layoutKind === 'listing'
      ? 'listing layout'
      : `${contentType.singularName.toLowerCase()} page layout`;
  const defaultLayoutName =
    design.layoutKind === 'listing'
      ? 'default listing layout'
      : 'default item layout';

  return (
    <Modal
      title={`Customize ${design.shortName}`}
      onRequestClose={onClose}
      className="content-customize-template-modal"
    >
      <div className="content-customize-template-modal-body">
        <p>
          Right now, {contentType.name} are using the site&apos;s{' '}
          {defaultLayoutName}. They do not have a {layoutKind} of their own yet.
        </p>
        <div className="content-customize-template-recommendation">
          <Text variant="body-sm" className="content-customize-template-label">
            Recommended
          </Text>
          <p>
            The editor will make a {contentType.name}-only layout based on the
            current one. It will look the same at first, and any changes you
            make after that will affect only {contentType.name}.
          </p>
        </div>
      </div>
      <div className="content-customize-template-modal-actions">
        <Button variant="primary" onClick={onCustomizeTemplate}>
          Customize {design.shortName}
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

function EditDefaultTemplateModal({
  contentType,
  design,
  onClose,
  onConfirm,
  onCreateInstead,
}) {
  if (!design) {
    return null;
  }

  const sharedUsageLabels = design.sharedUsageLabels?.length
    ? design.sharedUsageLabels
    : [contentType.name];
  const isListingTemplate = design.layoutKind === 'listing';
  const templateKind = isListingTemplate
    ? 'shared listing template'
    : 'shared template for individual content items';
  const missingTemplateKind = isListingTemplate
    ? 'listing template'
    : 'content-type-specific item template';

  return (
    <Modal
      title="Edit default template?"
      onRequestClose={onClose}
      className="content-default-template-modal"
    >
      <div className="content-default-template-modal-body">
        <p>
          You are about to edit the {templateKind}. The site uses this template
          whenever it cannot find a more specific {missingTemplateKind}.
        </p>
        <div className="content-default-template-impact">
          <Text variant="body-sm" className="content-default-template-impact-label">
            Changing this template will also affect:
          </Text>
          <ul>
            {sharedUsageLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="content-default-template-modal-actions">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={onCreateInstead}>
          Customize {design.shortName} instead
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Edit default template
        </Button>
      </div>
    </Modal>
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
  const selectedContentTypeIcon =
    CONTENT_TYPE_ICONS[selectedContentType?.iconKey] ||
    CONTENT_TYPE_ICONS[selectedContentType?.id] ||
    postList;
  const [activeTab, setActiveTab] = useState('records');

  const visibleDesigns = useMemo(
    () =>
      isDrilldown
        ? pageDesigns.filter(
            (design) =>
              design.contentTypeId === selectedContentType.id &&
              !design.isHomepageDesign,
          )
        : [],
    [isDrilldown, pageDesigns, selectedContentType],
  );
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [customizeTemplateDesign, setCustomizeTemplateDesign] = useState(null);
  const [defaultTemplateDesign, setDefaultTemplateDesign] = useState(null);
  const selectedDesign =
    visibleDesigns.find((design) => design.id === selectedDesignId) ||
    visibleDesigns[0];

  const resolvedHome = useMemo(() => {
    if (homepageDisplayMode === HOMEPAGE_DISPLAY_LATEST) {
      return pageDesigns.find((design) => design.id === 'blog-home-root');
    }
    return pages.find((page) => page.id === frontPageId) || currentPage;
  }, [currentPage, frontPageId, homepageDisplayMode, pageDesigns, pages]);

  const selectDesign = (design) => {
    setSelectedDesignId(design.id);
  };

  const openCustomizeTemplateModal = (design) => {
    selectDesign(design);
    setCustomizeTemplateDesign(design);
  };

  const editDesign = (design = selectedDesign) => {
    if (!design) return;
    if (isInactiveTemplate(design)) {
      selectDesign(design);
      setCustomizeTemplateDesign(null);
      setDefaultTemplateDesign(design);
      return;
    }
    navigate(`/page-designs/${design.id}/edit?inserter=patterns`);
  };

  const returnToCustomizeFlow = () => {
    const design = defaultTemplateDesign;
    setDefaultTemplateDesign(null);
    if (design) {
      setCustomizeTemplateDesign(design);
    }
  };

  const confirmDefaultTemplateEdit = () => {
    if (!defaultTemplateDesign) {
      return;
    }
    const route =
      defaultTemplateDesign.defaultTemplateRoute ||
      `/templates?contentType=${selectedContentType.id}`;
    setDefaultTemplateDesign(null);
    navigate(route);
  };

  const addRecordAction =
    isDrilldown && activeTab === 'records' ? (
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
        <div className="content-tabs" role="tablist" aria-label="Content details">
          <button
            type="button"
            className={`content-tab${activeTab === 'records' ? ' is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'records'}
            onClick={() => setActiveTab('records')}
          >
            <span className="content-tab-icon" aria-hidden>
              {selectedContentTypeIcon}
            </span>
            {selectedContentType.name}
          </button>
          <button
            type="button"
            className={`content-tab${activeTab === 'layouts' ? ' is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'layouts'}
            onClick={() => setActiveTab('layouts')}
          >
            <span className="content-tab-icon" aria-hidden>
              {grid}
            </span>
            {getTemplateScopeLabel(selectedContentType, { capitalize: true })}
          </button>
        </div>

        {activeTab === 'records' ? (
          <section className="content-section content-records-section" role="tabpanel">
            <ContentRecordsDataView
              key={selectedContentType.id}
              contentType={selectedContentType}
            />
          </section>
        ) : (
          <section className="content-section" role="tabpanel">
            <div className="page-design-list">
              {visibleDesigns.map((design) => (
                <PageDesignCard
                  key={design.id}
                  design={design}
                  isSelected={design.id === selectedDesign?.id}
                  onCustomize={() => openCustomizeTemplateModal(design)}
                  onSelect={() => selectDesign(design)}
                />
              ))}
            </div>
            <p className="content-template-gateway">
              For more advanced control over{' '}
              {getTemplateScopeLabel(selectedContentType)},{' '}
              <Link
                to={`/templates?contentType=${selectedContentType.id}`}
                className="content-template-gateway-link"
              >
                view all Templates
              </Link>
              .
            </p>
          </section>
        )}
      </div>
    </Page>
  ) : (
    <Page
      className="content-stage-frame"
      title="Content"
      subTitle="Choose a content type to manage its items and page designs."
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

  const showPreview = !isDrilldown || activeTab === 'layouts';
  const canvasTarget = isDrilldown ? selectedDesign : resolvedHome;
  const canvasContent = showPreview && canvasTarget ? (
    <PreviewCanvas
      page={canvasTarget}
      onEdit={() => {
        if (isDrilldown) {
          editDesign(canvasTarget);
          return;
        }
        if (canvasTarget.isPageDesign) {
          navigate(`/page-designs/${canvasTarget.id}/edit?inserter=patterns`);
          return;
        }
        navigate(`/pages/${canvasTarget.id}/edit?inserter=patterns`);
      }}
      onPageChange={() => {}}
      editLabel="Edit"
      documentLabel={
        isDrilldown ? canvasTarget.previewLabel : canvasTarget.previewLabel || 'Homepage'
      }
      scopeNotice={isDrilldown ? canvasTarget.scopeNotice : undefined}
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
      {customizeTemplateDesign ? (
        <CustomizeTemplateModal
          contentType={selectedContentType}
          design={customizeTemplateDesign}
          onClose={() => setCustomizeTemplateDesign(null)}
          onCustomizeTemplate={showPrototypeNotImplementedAlert}
        />
      ) : null}
      {defaultTemplateDesign ? (
        <EditDefaultTemplateModal
          contentType={selectedContentType}
          design={defaultTemplateDesign}
          onClose={() => setDefaultTemplateDesign(null)}
          onConfirm={confirmDefaultTemplateEdit}
          onCreateInstead={returnToCustomizeFlow}
        />
      ) : null}
    </div>
  );
}

export default ContentView;
