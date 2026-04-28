import { RouterProvider } from 'react-router-dom';
import { AppStateProvider } from '../hooks/useAppState';
import { router } from '../router/routes';

function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  );
}

export default App;
