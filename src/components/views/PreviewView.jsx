import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import PreviewCanvas from '../shared/PreviewCanvas';

function PreviewView() {
  const navigate = useNavigate();
  const { currentPage, setCurrentPage } = useAppState();

  const handleEdit = () => {
    navigate(`/pages/${currentPage.id}/edit`);
  };

  return (
    <PreviewCanvas
      page={currentPage}
      onEdit={handleEdit}
      onPageChange={setCurrentPage}
    />
  );
}

export default PreviewView;
