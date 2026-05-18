import { Fragment, useCallback, useMemo, useState } from 'react';
import { Page } from '@wordpress/admin-ui';
import {
  Button,
  CheckboxControl,
  DropdownMenu,
  SelectControl,
  TextControl,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Text } from '@wordpress/ui';
import {
  comment,
  moreVertical,
  pencil,
  seen,
  trash,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { postRecords as sharedPostRecords } from '../../data/postRecords';
import PrototypeNotImplementedButton from '../shared/PrototypeNotImplemented';
import { showPrototypeNotImplementedAlert } from '../../utils/prototypeNotImplemented';

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

const POST_MONTH_ELEMENTS = [
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-01', label: 'January 2026' },
  { value: '2025-12', label: 'December 2025' },
];

const POST_TABLE_FIELDS = ['author', 'categories', 'comments', 'date'];

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

function getElementLabel(elements, value) {
  return elements.find((element) => element.value === value)?.label || value;
}

function getPostMonth(item) {
  return item.dateSortable.slice(0, 7);
}

function getPostDateState(item) {
  return item.status === 'draft' ? 'Last modified' : 'Published';
}

function formatPostDate(dateSortable) {
  return new Date(`${dateSortable}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizePostRecord(record) {
  return record;
}

function createQuickEditDraft(item) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    dateSortable: item.dateSortable,
    time: item.time,
    status: item.status,
    categories: [...item.categories],
  };
}

function QuickEditForm({ draft, onCancel, onChange, onSave }) {
  const setField = (field, value) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  const toggleCategory = (category) => {
    onChange((current) => {
      const hasCategory = current.categories.includes(category);
      const categories = hasCategory
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];
      return { ...current, categories };
    });
  };

  return (
    <section className="posts-quick-edit" aria-labelledby="posts-quick-edit-title">
      <div className="posts-quick-edit-header">
        <div className="posts-quick-edit-heading">
          <Text
            id="posts-quick-edit-title"
            variant="body-md"
            className="posts-quick-edit-title"
          >
            Quick edit
          </Text>
          <Text variant="body-sm" className="posts-quick-edit-subtitle">
            Update publishing details without leaving Posts.
          </Text>
        </div>
      </div>

      <div className="posts-quick-edit-grid">
        <div className="posts-quick-edit-column posts-quick-edit-column--primary">
          <TextControl
            __nextHasNoMarginBottom
            label="Title"
            value={draft.title}
            onChange={(value) => setField('title', value)}
          />
          <TextControl
            __nextHasNoMarginBottom
            label="Slug"
            value={draft.slug}
            onChange={(value) => setField('slug', value)}
          />
          <div className="posts-quick-edit-inline-fields">
            <TextControl
              __nextHasNoMarginBottom
              label="Date"
              type="date"
              value={draft.dateSortable}
              onChange={(value) => setField('dateSortable', value)}
            />
            <TextControl
              __nextHasNoMarginBottom
              label="Time"
              value={draft.time}
              onChange={(value) => setField('time', value)}
            />
          </div>
        </div>

        <fieldset className="posts-quick-edit-fieldset">
          <legend>Categories</legend>
          <div className="posts-quick-edit-checklist">
            {POST_CATEGORY_ELEMENTS.map((category) => (
              <CheckboxControl
                key={category.value}
                __nextHasNoMarginBottom
                label={category.label}
                checked={draft.categories.includes(category.value)}
                onChange={() => toggleCategory(category.value)}
              />
            ))}
          </div>
        </fieldset>

        <div className="posts-quick-edit-column">
          <SelectControl
            __nextHasNoMarginBottom
            label="Status"
            value={draft.status}
            options={POST_STATUS_ELEMENTS}
            onChange={(value) => setField('status', value)}
          />
        </div>
      </div>

      <div className="posts-quick-edit-actions">
        <Button variant="primary" onClick={onSave}>
          Update
        </Button>
        <Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
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
      {item.status === 'draft' ? (
        <span className="posts-title-status">Draft</span>
      ) : null}
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

function renderComments({ item }) {
  return (
    <span className="posts-comments-cell" aria-label={`${item.comments} comments`}>
      <span className="posts-comments-icon" aria-hidden="true">
        {comment}
      </span>
      <span className="posts-record-count">{item.comments}</span>
    </span>
  );
}

function renderDate({ item }) {
  return (
    <span className="posts-date-cell">
      <span className="posts-date-state">{getPostDateState(item)}</span>
      <span className="posts-record-muted">
        {item.date} at {item.time}
      </span>
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
    filterBy: { operators: ['isAny', 'isAll', 'isNone'], isPrimary: true },
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
    render: renderComments,
  },
  {
    id: 'date',
    type: 'text',
    label: 'Date',
    getValue: ({ item }) => item.dateSortable,
    render: renderDate,
  },
  {
    id: 'status',
    type: 'text',
    label: 'Status',
    elements: POST_STATUS_ELEMENTS,
    filterBy: { operators: ['isAny'], isPrimary: true },
    render: renderStatus,
  },
  {
    id: 'month',
    type: 'text',
    label: 'Date',
    elements: POST_MONTH_ELEMENTS,
    filterBy: { operators: ['isAny'], isPrimary: true },
    enableHiding: false,
    getValue: ({ item }) => getPostMonth(item),
    render: ({ item }) => getElementLabel(POST_MONTH_ELEMENTS, getPostMonth(item)),
  },
];

function getSortDirection(view, field) {
  return view.sort?.field === field ? view.sort.direction : null;
}

function PostsTableHeaderButton({ field, label, view, onChangeView }) {
  const direction = getSortDirection(view, field);
  const nextDirection = direction === 'asc' ? 'desc' : 'asc';

  return (
    <button
      type="button"
      className={`posts-table-sort${direction ? ' is-sorted' : ''}`}
      onClick={() =>
        onChangeView({
          ...view,
          page: 1,
          sort: {
            field,
            direction: nextDirection,
          },
        })
      }
    >
      {label}
      <span className="posts-table-sort-indicator" aria-hidden="true">
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    </button>
  );
}

function PostsRecordsTable({
  data,
  onChangeView,
  onQuickEdit,
  onSaveQuickEdit,
  onSelect,
  quickEditDraft,
  recordsView,
  selection,
  setQuickEditDraft,
  setSelection,
}) {
  const visibleIds = data.map((item) => item.id);
  const selectedVisibleIds = visibleIds.filter((id) => selection.includes(id));
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleIds.length === visibleIds.length;

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelection(selection.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelection(Array.from(new Set([...selection, ...visibleIds])));
  };

  const toggleRow = (id) => {
    setSelection(
      selection.includes(id)
        ? selection.filter((selectedId) => selectedId !== id)
        : [...selection, id],
    );
  };

  if (!data.length) {
    return (
      <div className="posts-table-empty">
        No posts found.
      </div>
    );
  }

  return (
    <table className="posts-table">
      <thead>
        <tr>
          <th className="posts-table-check">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              aria-label="Select all visible posts"
              onChange={toggleAllVisible}
            />
          </th>
          <th>
            <PostsTableHeaderButton
              field="title"
              label="Title"
              view={recordsView}
              onChangeView={onChangeView}
            />
          </th>
          <th>Author</th>
          <th>Categories</th>
          <th className="posts-table-comments-heading">
            <span className="posts-comments-icon" aria-label="Comments">
              {comment}
            </span>
          </th>
          <th>
            <PostsTableHeaderButton
              field="date"
              label="Date"
              view={recordsView}
              onChangeView={onChangeView}
            />
          </th>
          <th className="posts-table-actions-heading">
            <span className="screen-reader-text">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => {
          const isSelected = selection.includes(item.id);
          const isQuickEditing = quickEditDraft?.id === item.id;
          return (
            <Fragment key={item.id}>
              <tr className={isQuickEditing ? 'is-quick-editing' : ''}>
                <td className="posts-table-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    aria-label={`Select ${item.title}`}
                    onChange={() => toggleRow(item.id)}
                  />
                </td>
                <td className="posts-table-title-cell">
                  <span className="posts-table-title-stack">
                    <button
                      type="button"
                      className="posts-record-title-link"
                      onClick={() => onSelect(item)}
                    >
                      {item.title}
                    </button>
                    {item.status === 'draft' ? (
                      <span className="posts-title-status">Draft</span>
                    ) : null}
                    {item.slug ? (
                      <span className="posts-record-slug">/{item.slug}</span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <span className="posts-record-muted">{item.author}</span>
                </td>
                <td>{renderTerms(item.categories)}</td>
                <td>{renderComments({ item })}</td>
                <td>{renderDate({ item })}</td>
                <td className="posts-table-actions-cell">
                  <DropdownMenu
                    icon={moreVertical}
                    label={`Actions for ${item.title}`}
                    toggleProps={{
                      variant: 'tertiary',
                      className: 'posts-row-actions-toggle',
                    }}
                    controls={[
                      {
                        title: 'Edit',
                        icon: pencil,
                        onClick: () => onSelect(item),
                      },
                      {
                        title: 'Quick edit',
                        icon: pencil,
                        onClick: () => onQuickEdit(item),
                      },
                      {
                        title: 'View',
                        icon: seen,
                        onClick: showPrototypeNotImplementedAlert,
                      },
                      {
                        title: 'Move to trash',
                        icon: trash,
                        onClick: showPrototypeNotImplementedAlert,
                      },
                    ]}
                  />
                </td>
              </tr>
              {isQuickEditing ? (
                <tr className="posts-table-quick-edit-row">
                  <td colSpan={7}>
                    <QuickEditForm
                      draft={quickEditDraft}
                      onCancel={() => setQuickEditDraft(null)}
                      onChange={setQuickEditDraft}
                      onSave={onSaveQuickEdit}
                    />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function PostsView() {
  const { showSnackbar } = useAppState();
  const [postRecords, setPostRecords] = useState(() =>
    sharedPostRecords.map(normalizePostRecord),
  );
  const [recordsView, setRecordsView] = useState(DEFAULT_POSTS_VIEW);
  const [selection, setSelection] = useState([]);
  const [quickEditDraft, setQuickEditDraft] = useState(null);

  const openQuickEdit = useCallback((item) => {
    setSelection([]);
    setQuickEditDraft(createQuickEditDraft(normalizePostRecord(item)));
  }, []);

  const saveQuickEdit = useCallback(() => {
    if (!quickEditDraft) {
      return;
    }
    setPostRecords((records) =>
      records.map((record) =>
        record.id === quickEditDraft.id
          ? {
              ...record,
              title: quickEditDraft.title,
              slug: quickEditDraft.slug,
              date: formatPostDate(quickEditDraft.dateSortable),
              dateSortable: quickEditDraft.dateSortable,
              time: quickEditDraft.time,
              status: quickEditDraft.status,
              categories: quickEditDraft.categories,
            }
          : record,
      ),
    );
    showSnackbar(`Updated "${quickEditDraft.title}".`);
    setQuickEditDraft(null);
  }, [quickEditDraft, showSnackbar]);

  const postRecordActions = useMemo(
    () => [
      {
        id: 'edit',
        label: 'Edit',
        icon: pencil,
        isPrimary: true,
        callback: showPrototypeNotImplementedAlert,
      },
      {
        id: 'quick-edit',
        label: 'Quick edit',
        icon: pencil,
        callback: (items) => openQuickEdit(items[0]),
      },
      {
        id: 'view',
        label: 'View',
        icon: seen,
        callback: showPrototypeNotImplementedAlert,
      },
      {
        id: 'trash',
        label: (items) =>
          items.length > 1 ? `Move ${items.length} posts to trash` : 'Move to trash',
        icon: trash,
        supportsBulk: true,
        callback: showPrototypeNotImplementedAlert,
      },
    ],
    [openQuickEdit],
  );

  const { data: processedRecords, paginationInfo } = useMemo(
    () => filterSortAndPaginate(postRecords, recordsView, POST_RECORD_FIELDS),
    [postRecords, recordsView],
  );

  const handleChangeRecordsView = (nextView) => {
    setRecordsView({
      ...nextView,
      type: 'table',
    });
  };

  const recordsContent = (
    <div className="posts-inner posts-dataviews">
      <DataViews
        data={processedRecords}
        fields={POST_RECORD_FIELDS}
        view={recordsView}
        onChangeView={handleChangeRecordsView}
        actions={postRecordActions}
        defaultLayouts={{ table: { fields: POST_TABLE_FIELDS } }}
        paginationInfo={paginationInfo}
        selection={selection}
        onChangeSelection={setSelection}
        isItemClickable={() => true}
        onClickItem={showPrototypeNotImplementedAlert}
        getItemId={(item) => item.id}
      >
        <div className="posts-records-toolbar">
          <DataViews.Search />
          <DataViews.Filters />
          <span className="posts-records-toolbar-spacer" />
        </div>
        <div className="posts-records-utility-row">
          <DataViews.BulkActionToolbar />
          <span className="posts-records-count">
            {paginationInfo.totalItems}{' '}
            {paginationInfo.totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="posts-records-table">
          <PostsRecordsTable
            data={processedRecords}
            recordsView={recordsView}
            onChangeView={handleChangeRecordsView}
            selection={selection}
            setSelection={setSelection}
            quickEditDraft={quickEditDraft}
            setQuickEditDraft={setQuickEditDraft}
            onQuickEdit={openQuickEdit}
            onSaveQuickEdit={saveQuickEdit}
            onSelect={showPrototypeNotImplementedAlert}
          />
          <DataViews.Pagination />
        </div>
      </DataViews>
    </div>
  );

  return (
    <div className="posts-panel show">
      <Page
        className="posts-panel__grid posts-content-frame"
        title="Posts"
        actions={(
          <PrototypeNotImplementedButton variant="primary">
            Add post
          </PrototypeNotImplementedButton>
        )}
        showSidebarToggle={false}
      >
        {recordsContent}
      </Page>
    </div>
  );
}

export default PostsView;
