import { useNavigate } from 'react-router-dom';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage, userName } = useAppState();

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit`);
  };

  return (
    <div className="cs-stack">
      <div className="cs-stack-canvas preview-body">
        <div className="preview-heading-row">
          <h1 className="preview-heading">Welcome back, {userName}</h1>
          <button
            type="button"
            className="preview-mode-select"
            disabled
            aria-label="Change preview mode (coming soon)"
          >
            <span>Site preview</span>
            <Icon icon={chevronDown} size={24} />
          </button>
        </div>
        <div className="preview-body-canvas">
          <PreviewCanvas
            page={currentPage}
            onEdit={handleEdit}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <ContentSuggestions />
    </div>
  );
}

export default PreviewView;
