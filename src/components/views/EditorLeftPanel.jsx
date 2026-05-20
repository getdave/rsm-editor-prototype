import BlockInserterContent from './BlockInserter';
import ListViewPanel from './ListViewPanel';

/**
 * Single sliding left panel for the Block Editor: block inserter or List View.
 * Same width animation as the former inserter sidebar; sits beside the editor column (pushes the Block Editor area).
 *
 * @param {object} props
 * @param {'inserter' | 'list' | null} props.mode — which panel is shown; null is collapsed
 * @param {object} props.listViewProps — passed to ListViewPanel when mode === 'list'
 */
export default function EditorLeftPanel({ mode, listViewProps }) {
  const show = mode === 'inserter' || mode === 'list';

  return (
    <div
      className={`edit-left-panel ${show ? 'show' : ''}`}
      aria-hidden={!show}
    >
      {mode === 'inserter' && <BlockInserterContent />}
      {mode === 'list' && <ListViewPanel {...listViewProps} />}
    </div>
  );
}
