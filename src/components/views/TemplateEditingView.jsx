import { useEffect } from 'react';
import { pages } from '../../data/mockData';
import { useAppState } from '../../hooks/useAppState';
import EditingView from './EditingView';

const TEMPLATE_DEMO_ID = 'blog-single';

function TemplateEditingView() {
  const { currentPage, setCurrentPage } = useAppState();

  useEffect(() => {
    if (currentPage?.id === TEMPLATE_DEMO_ID) return;
    const template = pages.find((p) => p.id === TEMPLATE_DEMO_ID);
    if (template) setCurrentPage(template);
  }, [currentPage?.id, setCurrentPage]);

  if (currentPage?.id !== TEMPLATE_DEMO_ID) return null;
  return <EditingView />;
}

export default TemplateEditingView;
