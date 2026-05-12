import { Stack, Text } from '@wordpress/ui';
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
      <Stack direction="row" align="center" className="ps-hd">
        <Text variant="body-sm" className="ps-title">Pages</Text>
        <button className="ps-add">+</button>
      </Stack>
      <div className="ps-list">
        {contentPages.map((page) => (
          <PageRow key={page.id} page={page} onClick={handlePageClick} />
        ))}
      </div>
    </div>
  );
}

export default PagesStrip;
