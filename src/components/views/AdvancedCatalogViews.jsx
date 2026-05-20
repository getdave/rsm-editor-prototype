import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { Page } from '@wordpress/admin-ui';
import { Text } from '@wordpress/ui';
import {
  copy,
  external,
  pencil,
  settings,
  seen,
} from '@wordpress/icons';
import {
  advancedPatterns,
  advancedTemplates,
  templateParts,
} from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import PrototypeNotImplementedButton from '../shared/PrototypeNotImplemented';

const GRID_PREVIEW_SIZE = 280;

const DEFAULT_VIEW = {
  type: 'grid',
  search: '',
  filters: [],
  page: 1,
  perPage: 24,
  sort: {
    field: 'name',
    direction: 'asc',
  },
  titleField: 'name',
  mediaField: 'preview',
  fields: ['description', 'meta'],
  layout: { previewSize: GRID_PREVIEW_SIZE },
};

const DEFAULT_LAYOUTS = {
  grid: {
    badgeFields: ['statusLabel'],
    layout: { previewSize: GRID_PREVIEW_SIZE },
  },
  list: { layout: { density: 'compact' } },
  table: {},
};

function Bar({ wide, narrow, short }) {
  return (
    <span
      className={`adv-preview-bar${wide ? ' is-wide' : ''}${narrow ? ' is-narrow' : ''}${short ? ' is-short' : ''}`}
      aria-hidden="true"
    />
  );
}

function CatalogPreview({ item }) {
  const kind = item.previewKind;

  if (kind === 'cover') {
    return (
      <div className="adv-preview adv-preview--cover">
        <span className="adv-preview-image" aria-hidden="true" />
        <span className="adv-preview-cover-title" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'gallery') {
    return (
      <div className="adv-preview adv-preview--gallery">
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (kind === 'cards') {
    return (
      <div className="adv-preview adv-preview--cards">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (kind === 'map') {
    return (
      <div className="adv-preview adv-preview--map">
        <div className="adv-preview-stack">
          <Bar wide />
          <Bar narrow short />
        </div>
        <span className="adv-preview-map-tile" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'quote') {
    return (
      <div className="adv-preview adv-preview--quote">
        <span className="adv-preview-quote-mark" aria-hidden="true" />
        <Bar wide />
        <Bar />
        <Bar narrow short />
      </div>
    );
  }

  if (kind === 'posts' || kind === 'blog' || kind === 'archive') {
    return (
      <div className={`adv-preview adv-preview--${kind}`}>
        <div className="adv-preview-stack">
          <Bar wide />
          <Bar narrow short />
        </div>
        <div className="adv-preview-list">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (kind === 'single') {
    return (
      <div className="adv-preview adv-preview--single">
        <Bar wide />
        <Bar narrow short />
        <div className="adv-preview-stack">
          <Bar />
          <Bar wide />
          <Bar narrow short />
        </div>
      </div>
    );
  }

  if (kind === 'search') {
    return (
      <div className="adv-preview adv-preview--search">
        <Bar wide />
        <span className="adv-preview-search-pill" aria-hidden="true" />
        <span className="adv-preview-image" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'error') {
    return (
      <div className="adv-preview adv-preview--error">
        <span className="adv-preview-error-code" aria-hidden="true" />
        <Bar wide />
        <Bar narrow short />
      </div>
    );
  }

  if (kind === 'header' || kind === 'header-promo') {
    return (
      <div className={`adv-preview adv-preview--${kind}`}>
        {kind === 'header-promo' && <span className="adv-preview-promo" aria-hidden="true" />}
        <div className="adv-preview-header-row">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (kind === 'footer' || kind === 'footer-columns') {
    return (
      <div className={`adv-preview adv-preview--${kind}`}>
        <div className="adv-preview-footer-row">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (kind === 'comments') {
    return (
      <div className="adv-preview adv-preview--comments">
        <Bar wide />
        <div className="adv-preview-comments">
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (kind === 'navigation-overlay') {
    return (
      <div className="adv-preview adv-preview--navigation-overlay">
        <span className="adv-preview-overlay-close" aria-hidden="true" />
        <div className="adv-preview-stack">
          <Bar wide />
          <Bar />
          <Bar narrow />
        </div>
        <span className="adv-preview-overlay-cta" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'text-media' || kind === 'columns') {
    return (
      <div className={`adv-preview adv-preview--${kind}`}>
        <div className="adv-preview-stack">
          <Bar wide />
          <Bar />
          <Bar narrow short />
        </div>
        <span className="adv-preview-image" aria-hidden="true" />
      </div>
    );
  }

  if (kind === 'cta' || kind === 'intro' || kind === 'text') {
    return (
      <div className={`adv-preview adv-preview--${kind}`}>
        <Bar wide />
        <Bar />
        <Bar narrow short />
      </div>
    );
  }

  return (
    <div className="adv-preview adv-preview--page">
      <span className="adv-preview-image" aria-hidden="true" />
      <Bar wide />
      <Bar narrow short />
    </div>
  );
}

function getCategoryLabel(item, categoryKey) {
  if (categoryKey === 'areaLabel') {
    return item.areaLabel ?? item.area;
  }
  return item[categoryKey];
}

function buildCategories(items, categoryKey, allLabel) {
  if (!categoryKey) {
    return [];
  }
  const counts = new Map();
  items.forEach((item) => {
    const label = getCategoryLabel(item, categoryKey);
    if (!label) {
      return;
    }
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [
    { id: 'all', label: allLabel, count: items.length },
    ...Array.from(counts, ([label, count]) => ({
      id: label,
      label,
      count,
    })),
  ];
}

function CategoryRail({
  categories,
  activeCategory,
  onChangeCategory,
  title,
}) {
  if (!categories.length) {
    return null;
  }

  return (
    <aside className="adv-category-rail" aria-label={title}>
      <Text variant="body-sm" className="adv-category-rail-title">
        {title}
      </Text>
      <div className="adv-category-list">
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={`adv-category-button${activeCategory === category.id ? ' is-active' : ''}`}
            onClick={() => onChangeCategory(category.id)}
          >
            <span className="adv-category-label">{category.label}</span>
            <span className="adv-category-count">{category.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function Badge({ children, variant = 'neutral' }) {
  if (!children) {
    return null;
  }
  return <span className={`adv-badge adv-badge--${variant}`}>{children}</span>;
}

function createFields({ metaLabel }) {
  return [
    {
      id: 'preview',
      label: 'Preview',
      render: ({ item }) => <CatalogPreview item={item} />,
      enableSorting: false,
      enableHiding: false,
      enableGlobalSearch: false,
      filterBy: false,
    },
    {
      id: 'name',
      type: 'text',
      label: 'Title',
      enableHiding: false,
      enableGlobalSearch: true,
      getValue: ({ item }) => item.name,
      render: ({ item }) => (
        <span className="adv-title-cell">
          <span className="adv-title-cell-name">{item.name}</span>
        </span>
      ),
    },
    {
      id: 'description',
      type: 'text',
      label: 'Description',
      enableSorting: false,
      enableHiding: true,
      enableGlobalSearch: true,
      getValue: ({ item }) => item.description ?? '',
      render: ({ item }) => (
        <span className="adv-description-cell">{item.description}</span>
      ),
    },
    {
      id: 'meta',
      type: 'text',
      label: metaLabel,
      enableSorting: false,
      enableHiding: true,
      enableGlobalSearch: false,
      getValue: ({ item }) =>
        [item.authorDisplay, item.areaLabel, item.source]
          .filter(Boolean)
          .join(' '),
      render: ({ item }) => (
        <span className="adv-meta-cell">
          {item.authorDisplay ? (
            <span className="adv-meta-muted">{item.authorDisplay}</span>
          ) : null}
          {item.areaLabel ? (
            <Badge variant="area">{item.areaLabel}</Badge>
          ) : null}
          {item.source ? (
            <span className="adv-source-pill">{item.source}</span>
          ) : null}
        </span>
      ),
    },
    {
      id: 'statusLabel',
      type: 'text',
      label: 'Status',
      enableSorting: true,
      enableHiding: true,
      enableGlobalSearch: false,
      getValue: ({ item }) => item.syncStatus ?? item.statusLabel ?? '',
      render: ({ item }) => (
        <span className="adv-status-cell">
          <Badge variant={item.syncStatus ? 'sync' : 'theme'}>
            {item.syncStatus ?? item.statusLabel}
          </Badge>
        </span>
      ),
    },
    {
      id: 'category',
      type: 'text',
      label: 'Category',
      enableSorting: true,
      enableHiding: true,
      enableGlobalSearch: true,
      getValue: ({ item }) => item.category ?? item.areaLabel ?? '',
    },
    {
      id: 'usedIn',
      type: 'text',
      label: 'Used in',
      enableSorting: false,
      enableHiding: true,
      enableGlobalSearch: true,
      getValue: ({ item }) => (item.usedIn ?? []).join(', '),
      render: ({ item }) => (
        <span className="adv-used-in-cell">
          {item.usedIn?.length ? item.usedIn.join(', ') : 'Not assigned'}
        </span>
      ),
    },
  ];
}

function AdvancedCatalogView({
  title,
  description,
  items,
  actionLabel,
  categoryKey,
  categoryAllLabel,
  categoryTitle,
  metaLabel = 'Source',
  fields: visibleFields,
  onOpenItem,
  onAction,
}) {
  const [view, setView] = useState({
    ...DEFAULT_VIEW,
    fields: visibleFields,
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const fields = useMemo(() => createFields({ metaLabel }), [metaLabel]);
  const categories = useMemo(
    () => buildCategories(items, categoryKey, categoryAllLabel),
    [items, categoryKey, categoryAllLabel],
  );
  const filteredItems = useMemo(() => {
    if (!categoryKey || activeCategory === 'all') {
      return items;
    }
    return items.filter(
      (item) => getCategoryLabel(item, categoryKey) === activeCategory,
    );
  }, [items, categoryKey, activeCategory]);
  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(filteredItems, view, fields),
    [filteredItems, view, fields],
  );
  const actions = useMemo(
    () => [
      {
        id: 'edit',
        label: 'Edit',
        icon: pencil,
        isPrimary: true,
        callback: (selectedItems) => onOpenItem(selectedItems[0]),
      },
      {
        id: 'preview',
        label: 'Preview',
        icon: seen,
        callback: (selectedItems) => onAction('Preview', selectedItems[0]),
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: copy,
        callback: (selectedItems) => onAction('Duplicate', selectedItems[0]),
      },
      {
        id: 'view',
        label: 'View live',
        icon: external,
        callback: (selectedItems) => onAction('View live', selectedItems[0]),
      },
    ],
    [onOpenItem, onAction],
  );

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setView((current) => ({ ...current, page: 1 }));
  };

  return (
    <div className="pages-panel show advanced-catalog-panel">
      <Page
        className="pages-panel__grid pages-content-frame advanced-catalog-frame"
        title={title}
        actions={
          <PrototypeNotImplementedButton variant="primary">
            {actionLabel}
          </PrototypeNotImplementedButton>
        }
        showSidebarToggle={false}
      >
        <div className="advanced-catalog-layout">
          <CategoryRail
            categories={categories}
            activeCategory={activeCategory}
            onChangeCategory={handleCategoryChange}
            title={categoryTitle}
          />
          <div className="pp-inner pp-dataviews advanced-catalog">
            {description ? (
              <Text variant="body-md" className="advanced-catalog-description">
                {description}
              </Text>
            ) : null}
            <DataViews
              data={processedData}
              fields={fields}
              view={view}
              onChangeView={setView}
              defaultLayouts={DEFAULT_LAYOUTS}
              actions={actions}
              paginationInfo={paginationInfo}
              isItemClickable={() => true}
              onClickItem={onOpenItem}
              getItemId={(item) => item.id}
            >
              <div className="pp-toolbar-controls advanced-catalog-toolbar">
                <div className="pp-toolbar-row-options">
                  <DataViews.Search />
                  <DataViews.LayoutSwitcher />
                  <Button
                    variant="tertiary"
                    icon={settings}
                    label="View settings"
                    onClick={() => onAction('View settings')}
                  />
                </div>
              </div>
              <div className="pp-dv-scroll advanced-catalog-scroll">
                <DataViews.Layout />
                <DataViews.Pagination />
              </div>
            </DataViews>
          </div>
        </div>
      </Page>
    </div>
  );
}

export function TemplatesView() {
  const navigate = useNavigate();
  const { showSnackbar } = useAppState();

  const handleAction = (action, item) => {
    showSnackbar(
      item
        ? `${action} "${item.name}" is a prototype action.`
        : `${action} is a prototype action.`,
    );
  };

  return (
    <AdvancedCatalogView
      title="Templates"
      description="Create new templates, or reset any customizations made to the templates supplied by your theme."
      items={advancedTemplates}
      actionLabel="Add Template"
      metaLabel="Theme"
      fields={['description', 'meta']}
      onOpenItem={(item) => navigate(`/templates/${item.editPageId ?? item.id}/edit`)}
      onAction={handleAction}
    />
  );
}

export function PatternsView() {
  const navigate = useNavigate();
  const { pages, selectPage, showSnackbar } = useAppState();

  const handleOpenItem = (item) => {
    const targetPage =
      pages.find((page) => page.isFrontPage) ??
      pages.find((page) => page.id === 'home') ??
      pages[0];
    if (targetPage) {
      selectPage(targetPage);
      navigate(`/pages/${targetPage.id}/edit?inserter=patterns&pattern=${item.id}`);
    }
  };

  const handleAction = (action, item) => {
    showSnackbar(
      item
        ? `${action} "${item.name}" is a prototype action.`
        : `${action} is a prototype action.`,
    );
  };

  return (
    <AdvancedCatalogView
      title="Patterns"
      description="Manage what patterns are available when editing the site."
      items={advancedPatterns}
      actionLabel="Add Pattern"
      categoryKey="category"
      categoryAllLabel="All patterns"
      categoryTitle="Categories"
      metaLabel="Theme"
      fields={['statusLabel', 'meta']}
      onOpenItem={handleOpenItem}
      onAction={handleAction}
    />
  );
}

export function TemplatePartsView() {
  const navigate = useNavigate();
  const { showSnackbar } = useAppState();

  const handleAction = (action, item) => {
    showSnackbar(
      item
        ? `${action} "${item.name}" is a prototype action.`
        : `${action} is a prototype action.`,
    );
  };

  return (
    <AdvancedCatalogView
      title="Template Parts"
      description="Includes every template part defined for any area."
      items={templateParts}
      actionLabel="Add Template Part"
      categoryKey="areaLabel"
      categoryAllLabel="All parts"
      categoryTitle="Areas"
      metaLabel="Used in"
      fields={['description', 'usedIn', 'meta']}
      onOpenItem={(item) =>
        navigate(`/templates/${item.editTemplateId ?? 'index'}/edit?part=${item.id}`)
      }
      onAction={handleAction}
    />
  );
}
