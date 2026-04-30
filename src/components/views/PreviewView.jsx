import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';
import ContentSuggestions from './ContentSuggestions';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage } = useAppState();

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit`);
  };

  return (
    <div className="cs-stack">
      <div className="cs-stack-canvas">
        <PreviewCanvas
          page={currentPage}
          onEdit={handleEdit}
          onPageChange={setCurrentPage}
        />
      </div>
      <ContentSuggestions />
    </div>
  );
}

export default PreviewView;
