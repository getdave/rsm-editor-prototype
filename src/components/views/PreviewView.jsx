import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage } = useAppState();

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit?inserter=patterns`);
  };

  return (
    <div className="cs-stack">
      <div className="cs-stack-canvas preview-body">
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
