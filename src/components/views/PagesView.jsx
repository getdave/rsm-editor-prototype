import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ToggleControl, Tooltip } from "@wordpress/components";
import { DataViews, filterSortAndPaginate } from "@wordpress/dataviews";
import { createInterpolateElement } from "@wordpress/element";
import {
  pencil,
  external,
  plus,
  copy,
  home,
  page as pageIcon,
  seen,
  chevronDown,
  chevronUp,
} from "@wordpress/icons";
import { useAppState } from "../../hooks/useAppState";
import { pages } from "../../data/mockData";
import SplitViewLayout from "../../layouts/SplitViewLayout";
import PreviewCanvas from "../shared/PreviewCanvas";
import DefinedTerm from "../shared/DefinedTerm";

const BADGE_STYLES = {
  WordPress: { background: "rgba(33,117,155,.12)", color: "#21759b" },
  Template: { background: "rgba(245,158,11,.12)", color: "#d97706" },
  Theme: { background: "rgba(139,92,246,.12)", color: "#7c3aed" },
  Plugin: { background: "rgba(34,197,94,.12)", color: "#16a34a" },
  WooCommerce: { background: "rgba(127,84,179,.12)", color: "#7f54b3" },
};

const TABS = [
  {
    value: "content",
    label: "Content",
    description:
      "These pages are created by an author or automatically created by a Plugin or WordPress.",
  },
  {
    value: "dynamic",
    label: "Dynamic",
    description: createInterpolateElement(
      "Dynamic pages use <term>Templates</term> that automatically generate pages from your content.",
      {
        term: (
          <DefinedTerm definition="Reusable page layouts in WordPress. Examples: Single Post template (for blog posts), Product Archive template (for product listings), Search Results template." />
        ),
      },
    ),
    descriptionLink: {
      text: "View all Templates",
      action: "view-templates",
    },
  },
];

const STATUS_ELEMENTS = [
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
];

const SYSTEM_FILTER_HIDE = Object.freeze([
  { field: "isSystem", operator: "is", value: false },
]);

const DEFAULT_VIEW = {
  type: "list",
  search: "",
  filters: [],
  page: 1,
  perPage: 50,
  sort: undefined,
  titleField: "name",
  mediaField: "media",
  fields: ["status", "inMenu", "authorDisplay"],
  layout: { density: "compact" },
};

const DEFAULT_LAYOUTS = {
  list: { layout: { density: "compact" } },
  grid: { badgeFields: ["authorDisplay"], layout: { previewSize: 60 } },
  table: {},
};

function AddNewCard() {
  return (
    <div className="pp-card pp-card-add">
      <div className="pp-card-thumb">
        <span className="pp-card-icon pp-card-icon-add">{plus}</span>
      </div>
      <div className="pp-card-body">
        <div className="pp-card-name">Add new</div>
      </div>
    </div>
  );
}

function renderAuthorCell(item) {
  const text = item.authorDisplay ?? "";
  if (!text) {
    return <span className="pp-author-empty">—</span>;
  }
  const style = text !== "John Doe" ? BADGE_STYLES[text] : undefined;
  if (style) {
    return (
      <span className="pp-badge" style={style}>
        {text}
      </span>
    );
  }
  return <span>{text}</span>;
}

function PagesView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pagesViewMode, setPagesViewMode } =
    useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [frontPageId, setFrontPageId] = useState(
    () => pages.find((p) => p.isFrontPage)?.id ?? "home",
  );
  const [activeCategory, setActiveCategory] = useState("content");
  const [view, setView] = useState({ ...DEFAULT_VIEW, type: pagesViewMode });
  const [showDrafts, setShowDrafts] = useState(false);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);

  const isGridLayout = view.type === "grid";

  const fields = useMemo(
    () => [
      {
        id: "media",
        label: "Icon",
        render: ({ item }) => (
          <span
            className={
              isGridLayout
                ? "pp-media-thumb pp-media-thumb--grid"
                : "pp-media-thumb"
            }
          >
            <span
              className="pp-media-thumb-icon"
              style={{ color: "#999", display: "flex" }}
            >
              {item.id === "home" ? home : pageIcon}
            </span>
            {item.isFrontPage ? (
              <span className="pp-front-page-overlay">Front page</span>
            ) : null}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        filterBy: false,
        enableGlobalSearch: false,
      },
      {
        id: "name",
        type: "text",
        label: "Title",
        enableHiding: false,
        enableGlobalSearch: true,
        render: ({ item }) => {
          const title = <span>{item.name}</span>;
          if (!item.titleTooltip) {
            return title;
          }
          return (
            <Tooltip text={item.titleTooltip} delay={400} placement="top">
              <span style={{ display: "inline-flex" }}>{title}</span>
            </Tooltip>
          );
        },
      },
      {
        id: "status",
        type: "text",
        label: "Status",
        elements: STATUS_ELEMENTS,
        filterBy: {
          operators: ["isAny"],
        },
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.status === "draft" ? (
            <span className="pp-badge pp-draft">Draft</span>
          ) : (
            <span className="pp-badge pp-live">Live</span>
          ),
      },
      {
        id: "inMenu",
        type: "boolean",
        label: "Menu",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) => Boolean(item.inMenu),
        render: ({ item }) =>
          item.inMenu ? (
            <span className="pp-badge pp-nav">Main Menu</span>
          ) : (
            <span className="pp-menu-empty">—</span>
          ),
      },
      {
        id: "isSystem",
        type: "boolean",
        label: "System template",
        getValue: ({ item }) => Boolean(item.isSystem),
        filterBy: {
          operators: ["is", "isNot"],
        },
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.isSystem ? (
            <span className="pp-badge pp-draft">System</span>
          ) : null,
      },
      {
        id: "authorDisplay",
        type: "text",
        label: "Author",
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) => item.authorDisplay ?? "",
        render: ({ item }) => renderAuthorCell(item),
      },
    ],
    [isGridLayout],
  );

  const actions = useMemo(
    () => [
      {
        id: "preview",
        label: "Preview",
        isPrimary: true,
        icon: seen,
        callback: (items) => setPreviewPage(items[0]),
      },
      {
        id: "edit",
        label: "Edit",
        icon: pencil,
        callback: (items) => {
          setCurrentPage(items[0]);
          navigate(`/pages/${items[0].id}/edit`);
        },
      },
      {
        id: "view-live",
        label: "View live",
        icon: external,
        callback: (items) => console.log("View live:", items[0].slug),
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: copy,
        callback: (items) => console.log("Duplicate:", items[0].slug),
      },
      {
        id: "set-as-homepage",
        label: "Set as Homepage",
        isEligible: (item) =>
          item.category === "content" && item.id !== frontPageId,
        callback: (items, { onActionPerformed } = {}) => {
          setFrontPageId(items[0].id);
          setPreviewPage(items[0]);
          onActionPerformed?.(items);
        },
      },
      {
        id: "set-as-homepage-current",
        label: "Set as Homepage",
        isEligible: (item) =>
          item.category === "content" && item.id === frontPageId,
        disabled: true,
        callback: () => {},
      },
    ],
    [navigate, setCurrentPage, setPreviewPage, frontPageId],
  );

  const categoryPages = useMemo(() => {
    let filtered = pages
      .map((p) => ({
        ...p,
        isFrontPage: p.category === "content" && p.id === frontPageId,
      }))
      .filter((p) => p.category === activeCategory);

    if (activeCategory === "content" && !showDrafts) {
      filtered = filtered.filter((p) => p.status !== "draft");
    }

    return filtered;
  }, [activeCategory, showDrafts, frontPageId]);

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(categoryPages, view, fields),
    [categoryPages, view, fields],
  );

  const handleChangeView = (newView) => {
    if (newView.type !== view.type) {
      setPagesViewMode(newView.type);
    }
    setView(newView);
  };

  const hasPreviewPanel = view.type === "list";

  const handleTabClick = (value) => {
    setActiveCategory(value);
    setView((prev) => ({
      ...prev,
      page: 1,
      search: "",
      filters: value === "dynamic" ? [...SYSTEM_FILTER_HIDE] : [],
    }));
  };

  const activeTab = TABS.find((t) => t.value === activeCategory);

  const stageContent = (
    <div className="pp-inner pp-dataviews">
      <DataViews
        data={processedData}
        fields={fields}
        view={view}
        onChangeView={handleChangeView}
        defaultLayouts={DEFAULT_LAYOUTS}
        actions={actions}
        paginationInfo={paginationInfo}
        onChangeSelection={(ids) => {
          if (ids.length === 1) {
            const clicked = categoryPages.find((p) => p.id === ids[0]);
            if (clicked) setPreviewPage(clicked);
          }
        }}
        isItemClickable={() => true}
        onClickItem={(item) => {
          if (!hasPreviewPanel) {
            setCurrentPage(item);
            navigate(`/pages/${item.id}/edit`);
          } else {
            setPreviewPage(item);
          }
        }}
        getItemId={(item) => item.id}
        getItemLevel={(item) => item.level ?? 0}
      >
        <div className="pp-hd">
          <span className="pp-title">Pages</span>
          <Button
            variant="primary"
            icon={plus}
            iconSize={16}
            onClick={() => console.log("Add page")}
          >
            Add page
          </Button>
        </div>
        <div className="pp-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`pp-tab${activeCategory === tab.value ? " on" : ""}`}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pp-toolbar-controls">
          <div className="pp-notice-toolbar-row">
            <div className="pp-notice-toolbar-col pp-notice-toolbar-col--notice">
              {activeTab?.description && (
                <div className="pp-tab-desc">
                  <div className="pp-tab-desc-content">
                    <span>{activeTab.description}</span>
                    {activeTab.descriptionLink && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="pp-desc-link"
                          onClick={() => navigate("/templates")}
                        >
                          {activeTab.descriptionLink.text} →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="pp-notice-toolbar-col pp-notice-toolbar-col--actions">
              <Button
                variant="tertiary"
                className="pp-view-options-toggle"
                onClick={() => setViewOptionsOpen((o) => !o)}
                aria-expanded={viewOptionsOpen}
              >
                View options
                <span className="pp-view-options-chevron">
                  {viewOptionsOpen ? chevronUp : chevronDown}
                </span>
              </Button>
              {activeCategory === "content" && (
                <ToggleControl
                  label="Show drafts"
                  checked={showDrafts}
                  onChange={setShowDrafts}
                  className="pp-system-toggle"
                />
              )}
            </div>
          </div>
          {viewOptionsOpen && (
            <div className="pp-toolbar-row-options">
              <DataViews.Search />
              <DataViews.FiltersToggle />
              <DataViews.LayoutSwitcher />
            </div>
          )}
        </div>
        <div className="pp-dv-filters">
          <DataViews.FiltersToggled />
        </div>
        <div className="pp-dv-scroll">
          <DataViews.Layout />
          <DataViews.Pagination />
        </div>
      </DataViews>
    </div>
  );

  const canvasContent = (
    <PreviewCanvas
      page={previewPage}
      onEdit={() => navigate(`/pages/${previewPage.id}/edit`)}
      onPageChange={setPreviewPage}
    />
  );

  return (
    <div className="pages-panel show">
      <SplitViewLayout
        mode={hasPreviewPanel ? "list" : "grid"}
        stageContent={stageContent}
        canvasContent={canvasContent}
        gridContent={stageContent}
      />
    </div>
  );
}

export default PagesView;
