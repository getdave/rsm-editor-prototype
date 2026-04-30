import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Notice, ToggleControl } from "@wordpress/components";
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
    description: null,
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
      }
    ),
  },
];

const STATUS_ELEMENTS = [
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
];

const DEFAULT_VIEW = {
  type: "list",
  search: "",
  filters: [],
  page: 1,
  perPage: 50,
  sort: undefined,
  titleField: "name",
  mediaField: "media",
  fields: ["status", "inMenu", "badges"],
  layout: { density: "compact" },
};

const DEFAULT_LAYOUTS = {
  list: { layout: { density: "compact" } },
  grid: { badgeFields: ["badges"], layout: { previewSize: 170 } },
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

function PagesView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, pagesViewMode, setPagesViewMode } =
    useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [activeCategory, setActiveCategory] = useState("content");
  const [view, setView] = useState({ ...DEFAULT_VIEW, type: pagesViewMode });
  const [showSystemPages, setShowSystemPages] = useState(false);
  const [showDrafts, setShowDrafts] = useState(true);

  const fields = useMemo(
    () => [
      {
        id: "media",
        label: "Icon",
        render: ({ item }) => (
          <span
            style={{
              color: item.id === "home" ? "#3858e9" : "#999",
              display: "flex",
            }}
          >
            {item.id === "home" ? home : pageIcon}
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
        render: ({ item }) => (
          <span
            style={{
              color: item.id === "home" ? "#3858e9" : "inherit",
              fontWeight: item.id === "home" ? 600 : "inherit",
            }}
          >
            {item.name}
          </span>
        ),
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
        label: "In menu",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.inMenu ? <span className="pp-badge pp-nav">In menu</span> : null,
      },
      {
        id: "badges",
        label: "Source",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) => item.badges ?? [],
        render: ({ item }) => {
          if (!item.badges || item.badges.length === 0) return null;
          return (
            <span style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {item.badges.map((badge) => (
                <span
                  key={badge}
                  className="pp-badge"
                  style={BADGE_STYLES[badge] ?? {}}
                >
                  {badge}
                </span>
              ))}
            </span>
          );
        },
      },
    ],
    [],
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
    ],
    [navigate, setCurrentPage, setPreviewPage],
  );

  const categoryPages = useMemo(() => {
    let filtered = pages.filter((p) => p.category === activeCategory);
    
    // In Content tab, hide drafts unless toggled on
    if (activeCategory === "content" && !showDrafts) {
      filtered = filtered.filter((p) => p.status !== "draft");
    }
    
    // In Dynamic tab, hide system pages by default unless toggled on
    if (activeCategory === "dynamic" && !showSystemPages) {
      filtered = filtered.filter((p) => !p.isSystem);
    }
    
    return filtered;
  }, [activeCategory, showSystemPages, showDrafts]);

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
    setView((prev) => ({ ...prev, page: 1, search: "", filters: [] }));
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
          <DataViews.Search />
          <DataViews.FiltersToggle />
          <DataViews.LayoutSwitcher />
          {activeCategory === "content" && (
            <>
              <div className="pp-toolbar-spacer" />
              <ToggleControl
                label="Show drafts"
                checked={showDrafts}
                onChange={setShowDrafts}
                className="pp-system-toggle"
              />
            </>
          )}
          {activeCategory === "dynamic" && (
            <>
              <div className="pp-toolbar-spacer" />
              <ToggleControl
                label="Show system pages"
                checked={showSystemPages}
                onChange={setShowSystemPages}
                className="pp-system-toggle"
              />
            </>
          )}
        </div>
        {activeTab?.description && (
          <div className="pp-tab-desc">
            <div className="pp-tab-desc-content">
              {activeTab.description}
            </div>
          </div>
        )}
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
