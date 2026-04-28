import { useAppState } from '../hooks/useAppState';
import { pages } from '../data/mockData';
import PageRow from './shared/PageRow';

function PagesStrip() {
  const { setCurrentPage } = useAppState();
  
  const contentPages = pages.filter(p => !p.isSystem);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="pages-strip">
      <div className="ps-hd">
        <span className="ps-title">Pages</span>
        <button className="ps-add">+</button>
      </div>
      <div className="ps-list">
        {contentPages.map((page) => (
          <PageRow key={page.id} page={page} onClick={handlePageClick} />
        ))}
      </div>
    </div>
  );
}

export default PagesStrip;
