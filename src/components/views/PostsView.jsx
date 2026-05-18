import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '@wordpress/admin-ui';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Text } from '@wordpress/ui';
import { page as pageIcon, postList } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import PrototypeNotImplementedButton from '../shared/PrototypeNotImplemented';
import { showPrototypeNotImplementedAlert } from '../../utils/prototypeNotImplemented';

const POST_RECORDS = [
  {
    id: 'post-1',
    title: 'How to Prepare for an Outdoor Portrait Session',
    slug: 'prepare-outdoor-portrait-session',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Guides'],
    tags: ['Portraits', 'Planning'],
    comments: 8,
    date: 'May 9, 2026',
    dateSortable: '2026-05-09',
  },
  {
    id: 'post-2',
    title: 'Behind the Scenes: Spring Wedding at Riverside Manor',
    slug: 'spring-wedding-riverside-manor',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Behind the Scenes'],
    tags: ['Weddings'],
    comments: 14,
    date: 'Apr 29, 2026',
    dateSortable: '2026-04-29',
  },
  {
    id: 'post-3',
    title: 'Five Simple Ways to Improve Product Photos',
    slug: 'improve-product-photos',
    status: 'published',
    author: 'Maya Chen',
    categories: ['Guides'],
    tags: ['Editing'],
    comments: 5,
    date: 'Apr 17, 2026',
    dateSortable: '2026-04-17',
  },
  {
    id: 'post-4',
    title: 'Client Story: A Brand Refresh for Northline Studio',
    slug: 'client-story-northline-studio',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Client Stories'],
    tags: ['Portraits'],
    comments: 3,
    date: 'Apr 2, 2026',
    dateSortable: '2026-04-02',
  },
  {
    id: 'post-5',
    title: 'Choosing the Right Backdrop for Headshots',
    slug: 'choosing-backdrop-headshots',
    status: 'published',
    author: 'Maya Chen',
    categories: ['Guides'],
    tags: ['Portraits', 'Planning'],
    comments: 2,
    date: 'Mar 21, 2026',
    dateSortable: '2026-03-21',
  },
  {
    id: 'post-6',
    title: 'What Happens During a Family Photo Shoot',
    slug: 'family-photo-shoot-process',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Guides'],
    tags: ['Planning', 'Portraits'],
    comments: 6,
    date: 'Mar 6, 2026',
    dateSortable: '2026-03-06',
  },
  {
    id: 'post-7',
    title: 'Editing Notes: Keeping Skin Tones Natural',
    slug: 'natural-skin-tones-editing',
    status: 'draft',
    author: 'Maya Chen',
    categories: ['Studio News'],
    tags: ['Editing'],
    comments: 0,
    date: 'Feb 26, 2026',
    dateSortable: '2026-02-26',
  },
  {
    id: 'post-8',
    title: 'Location Guide: Three Quiet Spots for Golden Hour',
    slug: 'quiet-golden-hour-locations',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Locations'],
    tags: ['Portraits', 'Planning'],
    comments: 11,
    date: 'Feb 12, 2026',
    dateSortable: '2026-02-12',
  },
  {
    id: 'post-9',
    title: 'How We Build a Shot List for Events',
    slug: 'event-shot-list-process',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Guides'],
    tags: ['Weddings', 'Planning'],
    comments: 4,
    date: 'Jan 28, 2026',
    dateSortable: '2026-01-28',
  },
  {
    id: 'post-10',
    title: 'Studio Update: New Print Finishes Available',
    slug: 'new-print-finishes',
    status: 'published',
    author: 'Maya Chen',
    categories: ['Studio News'],
    tags: ['Prints'],
    comments: 1,
    date: 'Jan 15, 2026',
    dateSortable: '2026-01-15',
  },
  {
    id: 'post-11',
    title: 'Planning a Mini Session Day',
    slug: 'planning-mini-session-day',
    status: 'draft',
    author: 'Avery Stone',
    categories: ['Studio News'],
    tags: ['Planning'],
    comments: 0,
    date: 'Jan 8, 2026',
    dateSortable: '2026-01-08',
  },
  {
    id: 'post-12',
    title: 'A Year in Review: Favorite Frames from 2025',
    slug: 'favorite-frames-2025',
    status: 'published',
    author: 'Avery Stone',
    categories: ['Behind the Scenes'],
    tags: ['Portraits', 'Weddings', 'Prints'],
    comments: 19,
    date: 'Dec 18, 2025',
    dateSortable: '2025-12-18',
  },
];

const POST_STATUS_ELEMENTS = [
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

const POST_TABLE_FIELDS = ['author', 'categories', 'date', 'status'];

const DEFAULT_POSTS_VIEW = {
  type: 'table',
  search: '',
  filters: [],
  page: 1,
  perPage: 10,
  sort: {
    field: 'date',
    direction: 'desc',
  },
  titleField: 'title',
  fields: POST_TABLE_FIELDS,
};

const POSTS_INDEX_TEMPLATE_PAGE = {
  id: 'posts-index-template',
  slug: 'posts-index',
  name: 'Posts page',
  type: 'Collection Page',
  isLive: true,
  inMenu: false,
  isSystem: false,
  isDynamic: true,
  isCollection: true,
  collectionBadge: 'Posts page',
  collectionOverlay: 'Posts page',
  pageKind: 'collection',
  category: 'collection',
  collectionKind: 'posts-index-template',
  viewKind: 'listing',
  status: 'live',
  level: 0,
  authorDisplay: 'WordPress',
  templateLabel: 'Posts listing',
  titleTooltip: 'Uses home.html for the posts index.',
};

const SINGLE_POST_TEMPLATE_PAGE = {
  id: 'blog-single',
  slug: 'blog-single',
  name: 'Single post',
  type: 'Collection Page',
  isLive: true,
  inMenu: false,
  isSystem: false,
  isDynamic: true,
  isCollection: true,
  pageKind: 'collection',
  category: 'collection',
  status: 'live',
  authorDisplay: 'WordPress',
  templateLabel: 'Single Post',
  collectionKind: 'post-single',
  viewKind: 'single',
  titleTooltip: 'Controls the generated layout visitors see for individual post pages.',
};

function getElementLabel(elements, value) {
  return elements.find((element) => element.value === value)?.label || value;
}

function renderTitle({ item }) {
  return (
    <span className="posts-record-title-cell">
      <button
        type="button"
        className="posts-record-title-link"
        onClick={showPrototypeNotImplementedAlert}
      >
        {item.title}
      </button>
      {item.slug ? (
        <span className="posts-record-slug">/{item.slug}</span>
      ) : null}
    </span>
  );
}

function renderStatus({ item }) {
  const label = getElementLabel(POST_STATUS_ELEMENTS, item.status);
  return (
    <span className={`posts-status-badge posts-status-badge--${item.status}`}>
      {label}
    </span>
  );
}

function renderTerms(terms) {
  if (!terms?.length) {
    return <span className="posts-record-empty">-</span>;
  }

  return (
    <span className="posts-term-list">
      {terms.map((term) => (
        <span key={term} className="posts-term-chip">
          {term}
        </span>
      ))}
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
      <span className="posts-record-muted">{item.author}</span>
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
      <span className="posts-record-count">{item.comments}</span>
    ),
  },
  {
    id: 'date',
    type: 'text',
    label: 'Date',
    getValue: ({ item }) => item.dateSortable,
    render: ({ item }) => (
      <span className="posts-record-muted">{item.date}</span>
    ),
  },
  {
    id: 'status',
    type: 'text',
    label: 'Status',
    elements: POST_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'] },
    render: renderStatus,
  },
];

function createPostsPageTarget(postsPage) {
  if (!postsPage) {
    return POSTS_INDEX_TEMPLATE_PAGE;
  }

  return {
    ...postsPage,
    name: 'Posts page',
    type: 'Collection Page',
    isLive: true,
    inMenu: Boolean(postsPage.inMenu),
    isSystem: false,
    isDynamic: true,
    isCollection: true,
    collectionBadge: 'Posts page',
    collectionOverlay: 'Posts page',
    pageKind: 'collection',
    category: 'collection',
    collectionKind: 'posts',
    viewKind: 'listing',
    status: 'live',
    authorDisplay: 'WordPress',
    templateLabel: 'Posts listing',
    titleTooltip:
      'Uses the selected Posts page URL while home.html controls the layout visitors see.',
    isPostsPage: true,
  };
}

function createSinglePostTarget(singlePostPage) {
  return {
    ...SINGLE_POST_TEMPLATE_PAGE,
    ...singlePostPage,
    name: 'Single post',
    isCollection: true,
    collectionKind: 'post-single',
    viewKind: 'single',
    templateLabel: 'Single Post',
  };
}

function PostDesignCard({ design, isSelected, onEdit, onSelect }) {
  return (
    <div className={`posts-design-card${isSelected ? ' is-selected' : ''}`}>
      <button
        type="button"
        className="posts-design-card-main"
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        <span className="posts-design-card-icon" aria-hidden="true">
          {design.icon}
        </span>
        <span className="posts-design-card-copy">
          <span className="posts-design-card-header">
            <Text variant="body-md" className="posts-design-card-title">
              {design.title}
            </Text>
            <span className="posts-design-card-status">Active</span>
          </span>
          <Text variant="body-sm" className="posts-design-card-desc">
            {design.description}
          </Text>
          <span className="posts-design-card-meta">{design.meta}</span>
        </span>
      </button>
      <span className="posts-design-card-action">
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
      </span>
    </div>
  );
}

function PostsView() {
  const navigate = useNavigate();
  const { pages, postsPageId, selectPage } = useAppState();
  const [activeTab, setActiveTab] = useState('records');
  const [selectedDesignId, setSelectedDesignId] = useState('posts-page');
  const [recordsView, setRecordsView] = useState(DEFAULT_POSTS_VIEW);

  const postRecordActions = useMemo(
    () => [
      {
        id: 'edit',
        label: 'Edit',
        isPrimary: true,
        callback: showPrototypeNotImplementedAlert,
      },
    ],
    [],
  );

  const { data: processedRecords, paginationInfo } = useMemo(
    () => filterSortAndPaginate(POST_RECORDS, recordsView, POST_RECORD_FIELDS),
    [recordsView],
  );

  const postDesigns = useMemo(() => {
    const postsPage = postsPageId
      ? pages.find((page) => page.id === postsPageId)
      : null;
    const postsPageTarget = createPostsPageTarget(postsPage);
    const singlePostTarget = createSinglePostTarget(
      pages.find((page) => page.id === 'blog-single'),
    );
    const assignedSlug = postsPageTarget.slug ? `/${postsPageTarget.slug}` : '/';

    return [
      {
        id: 'posts-page',
        title: 'Posts page',
        description: 'Change how your latest posts appear together.',
        meta:
          postsPage != null
            ? `Uses ${assignedSlug} for the public posts listing.`
            : 'No dedicated Posts page is assigned yet.',
        icon: postList,
        page: postsPageTarget,
      },
      {
        id: 'single-post',
        title: 'Single post',
        description: 'Change how individual posts appear.',
        meta: 'Applies to every published post.',
        icon: pageIcon,
        page: singlePostTarget,
      },
    ];
  }, [pages, postsPageId]);

  const selectedDesign =
    postDesigns.find((design) => design.id === selectedDesignId) ??
    postDesigns[0];

  const handleChangeRecordsView = (nextView) => {
    setRecordsView({
      ...nextView,
      type: 'table',
    });
  };

  const handleEditDesign = (design = selectedDesign) => {
    if (!design?.page) {
      return;
    }
    selectPage(design.page);
    navigate(`/pages/${design.page.id}/edit?inserter=patterns`);
  };

  const tabs = (
    <div className="posts-tabs" role="tablist" aria-label="Posts sections">
      <button
        type="button"
        className={`posts-tab${activeTab === 'records' ? ' is-active' : ''}`}
        role="tab"
        aria-selected={activeTab === 'records'}
        onClick={() => setActiveTab('records')}
      >
        <span className="posts-tab-icon" aria-hidden="true">
          {postList}
        </span>
        Posts
      </button>
      <button
        type="button"
        className={`posts-tab${activeTab === 'designs' ? ' is-active' : ''}`}
        role="tab"
        aria-selected={activeTab === 'designs'}
        onClick={() => setActiveTab('designs')}
      >
        <span className="posts-tab-icon" aria-hidden="true">
          {pageIcon}
        </span>
        Post designs
      </button>
    </div>
  );

  const recordsContent = (
    <div className="posts-inner posts-dataviews">
      {tabs}
      <DataViews
        data={processedRecords}
        fields={POST_RECORD_FIELDS}
        view={recordsView}
        onChangeView={handleChangeRecordsView}
        actions={postRecordActions}
        defaultLayouts={{ table: { fields: POST_TABLE_FIELDS } }}
        paginationInfo={paginationInfo}
        getItemId={(item) => item.id}
      >
        <div className="posts-records-toolbar">
          <DataViews.Search />
          <DataViews.FiltersToggle />
        </div>
        <div className="posts-records-filters">
          <DataViews.FiltersToggled />
        </div>
        <div className="posts-records-table">
          <DataViews.Layout />
          <DataViews.Pagination />
        </div>
      </DataViews>
    </div>
  );

  const designsContent = (
    <div className="posts-inner posts-designs">
      {tabs}
      <div className="posts-design-list" role="tabpanel">
        {postDesigns.map((design) => (
          <PostDesignCard
            key={design.id}
            design={design}
            isSelected={design.id === selectedDesign.id}
            onSelect={() => setSelectedDesignId(design.id)}
            onEdit={() => handleEditDesign(design)}
          />
        ))}
      </div>
      <p className="posts-template-gateway">
        For more advanced template control use{' '}
        <Link to="/templates" className="posts-template-gateway-link">
          Templates
        </Link>
        .
      </p>
    </div>
  );

  const pageActions =
    activeTab === 'records' ? (
      <PrototypeNotImplementedButton variant="primary">
        Add post
      </PrototypeNotImplementedButton>
    ) : null;

  if (activeTab === 'designs') {
    return (
      <div className="posts-panel show">
        <div className="split-view list posts-split">
          <Page
            className="split-view-stage posts-content-frame"
            title="Posts"
            actions={pageActions}
            showSidebarToggle={false}
          >
            {designsContent}
          </Page>
          <div
            className="split-view-canvas posts-preview-frame"
            role="region"
            aria-label="Preview"
          >
            <PreviewCanvas
              page={selectedDesign.page}
              onEdit={() => handleEditDesign(selectedDesign)}
              onPageChange={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-panel show">
      <Page
        className="posts-panel__grid posts-content-frame"
        title="Posts"
        actions={pageActions}
        showSidebarToggle={false}
      >
        {recordsContent}
      </Page>
    </div>
  );
}

export default PostsView;
