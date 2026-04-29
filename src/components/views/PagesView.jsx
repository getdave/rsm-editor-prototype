import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { pencil, external, plus, trash, copy, home, page as pageIcon } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { pages } from '../../data/mockData';
import SplitViewLayout from '../../layouts/SplitViewLayout';
import PreviewCanvas from '../shared/PreviewCanvas';

const BADGE_STYLES = {
  'WordPress': { background: 'rgba(33,117,155,.12)', color: '#21759b' },
  'Template':  { background: 'rgba(245,158,11,.12)',  color: '#d97706' },
  'Theme':     { background: 'rgba(139,92,246,.12)',  color: '#7c3aed' },
  'Plugin':    { background: 'rgba(34,197,94,.12)',   color: '#16a34a' },
  'WooCommerce': { background: 'rgba(127,84,179,.12)', color: '#7f54b3' },
};

const TABS = [
  { value: 'content', label: 'Content' },
  { value: 'system',  label: 'System'  },
  { value: 'dynamic', label: 'Dynamic' },
];

const STATUS_ELEMENTS = [
  { value: 'live',  label: 'Live'  },
  { value: 'draft', label: 'Draft' },
];

const DEFAULT_VIEW = {
  type: 'list',
  search: '',
  filters: [],
  page: 1,
  perPage: 50,
  sort: { field: 'name', direction: 'asc' },
  titleField: 'name',
  mediaField: 'media',
  fields: [ 'status', 'inMenu', 'badges' ],
  layout: {},
};

const DEFAULT_LAYOUTS = {
  list: {},
  grid: { badgeFields: [ 'badges' ] },
};

function AddNewCard() {
  return (
    <div className="pp-card pp-card-add">
      <div className="pp-card-thumb">
        <span className="pp-card-icon pp-card-icon-add">
          {plus}
        </span>
      </div>
      <div className="pp-card-body">
        <div className="pp-card-name">Add new</div>
      </div>
    </div>
  );
}

function PagesView() {
  const navigate = useNavigate();
  const { currentPage } = useAppState();
  const [ previewPage, setPreviewPage ] = useState( currentPage );
  const [ activeCategory, setActiveCategory ] = useState( 'content' );
  const [ view, setView ] = useState( DEFAULT_VIEW );
  const [ selection, setSelection ] = useState( [] );

  const fields = useMemo( () => [
    {
      id: 'media',
      label: 'Icon',
      render: ( { item } ) => (
        <span style={ { color: item.id === 'home' ? '#3858e9' : '#999', display: 'flex' } }>
          { item.id === 'home' ? home : pageIcon }
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
      filterBy: false,
      enableGlobalSearch: false,
    },
    {
      id: 'name',
      type: 'text',
      label: 'Title',
      enableHiding: false,
      enableGlobalSearch: true,
      render: ( { item } ) => (
        <span style={ { color: item.id === 'home' ? '#3858e9' : 'inherit', fontWeight: item.id === 'home' ? 600 : 'inherit' } }>
          { item.name }
        </span>
      ),
    },
    {
      id: 'status',
      type: 'text',
      label: 'Status',
      elements: STATUS_ELEMENTS,
      filterBy: {
        operators: [ 'isAny' ],
      },
      enableSorting: true,
      enableHiding: true,
      enableGlobalSearch: false,
      render: ( { item } ) =>
        item.status === 'draft'
          ? <span className="pp-badge pp-draft">Draft</span>
          : <span className="pp-badge pp-live">Live</span>,
    },
    {
      id: 'inMenu',
      type: 'boolean',
      label: 'In menu',
      enableSorting: false,
      enableHiding: true,
      enableGlobalSearch: false,
      render: ( { item } ) =>
        item.inMenu ? <span className="pp-badge pp-nav">In menu</span> : null,
    },
    {
      id: 'badges',
      label: 'Source',
      enableSorting: false,
      enableHiding: true,
      enableGlobalSearch: false,
      getValue: ( { item } ) => item.badges ?? [],
      render: ( { item } ) => {
        if ( ! item.badges || item.badges.length === 0 ) return null;
        return (
          <span style={ { display: 'flex', gap: '4px', flexWrap: 'wrap' } }>
            { item.badges.map( ( badge ) => (
              <span key={ badge } className="pp-badge" style={ BADGE_STYLES[ badge ] ?? {} }>
                { badge }
              </span>
            ) ) }
          </span>
        );
      },
    },
  ], [] );

  const actions = useMemo( () => [
    {
      id: 'edit',
      label: 'Edit',
      isPrimary: true,
      icon: pencil,
      callback: ( items ) => navigate( `/pages/${ items[ 0 ].id }/edit` ),
    },
    {
      id: 'view-live',
      label: 'View live',
      icon: external,
      callback: ( items ) => {
        console.log( 'View live:', items[ 0 ].slug );
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: copy,
      callback: ( items ) => {
        console.log( 'Duplicate:', items[ 0 ].slug );
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: trash,
      supportsBulk: true,
      isDestructive: true,
      RenderModal: ( { items, closeModal } ) => (
        <div style={ { padding: '16px' } }>
          <p>Delete { items.length === 1 ? `"${ items[ 0 ].name }"` : `${ items.length } pages` }? This cannot be undone.</p>
          <div style={ { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' } }>
            <Button variant="tertiary" onClick={ closeModal }>Cancel</Button>
            <Button
              variant="primary"
              isDestructive
              onClick={ () => {
                console.log( 'Delete:', items.map( i => i.slug ) );
                closeModal();
              } }
            >
              Delete
            </Button>
          </div>
        </div>
      ),
    },
  ], [ navigate ] );

  const categoryPages = useMemo(
    () => pages.filter( ( p ) => p.category === activeCategory ),
    [ activeCategory ]
  );

  const { data: processedData, paginationInfo } = useMemo( () =>
    filterSortAndPaginate( categoryPages, view, fields ),
    [ categoryPages, view, fields ]
  );

  const handleChangeView = ( newView ) => {
    setView( newView );
  };

  const isGridMode = view.type === 'grid';

  const headerSlot = (
    <Button
      variant="primary"
      icon={ plus }
      iconSize={ 16 }
      onClick={ () => console.log( 'Add page' ) }
    >
      Add page
    </Button>
  );

  const dataViewsEl = (
    <DataViews
      data={ processedData }
      fields={ fields }
      view={ view }
      onChangeView={ handleChangeView }
      defaultLayouts={ DEFAULT_LAYOUTS }
      actions={ actions }
      paginationInfo={ paginationInfo }
      selection={ selection }
      onChangeSelection={ setSelection }
      isItemClickable={ () => true }
      onClickItem={ ( item ) => setPreviewPage( item ) }
      header={ headerSlot }
      searchLabel="Search pages…"
      getItemId={ ( item ) => item.id }
    />
  );

  const handleTabClick = ( value ) => {
    setActiveCategory( value );
    setView( ( prev ) => ( { ...prev, page: 1, search: '', filters: [] } ) );
    setSelection( [] );
  };

  const stageContent = (
    <div className="pp-inner pp-dataviews">
      <div className="pp-hd">
        <span className="pp-title">Pages</span>
      </div>
      <div className="pp-tabs">
        { TABS.map( ( tab ) => (
          <button
            key={ tab.value }
            className={ `pp-tab${ activeCategory === tab.value ? ' on' : '' }` }
            onClick={ () => handleTabClick( tab.value ) }
          >
            { tab.label }
          </button>
        ) ) }
      </div>
      { isGridMode ? (
        <div className="pp-grid-with-add">
          <AddNewCard />
          { dataViewsEl }
        </div>
      ) : (
        dataViewsEl
      ) }
    </div>
  );

  const canvasContent = (
    <PreviewCanvas
      page={ previewPage }
      onEdit={ () => navigate( `/pages/${ previewPage.id }/edit` ) }
    />
  );

  return (
    <div className="pages-panel show">
      <SplitViewLayout
        mode={ isGridMode ? 'grid' : 'list' }
        stageContent={ stageContent }
        canvasContent={ canvasContent }
        gridContent={ stageContent }
      />
    </div>
  );
}

export default PagesView;
