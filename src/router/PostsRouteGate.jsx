import { Navigate } from 'react-router-dom';
import { useAppState, READING_DISPLAY_LATEST } from '../hooks/useAppState';

export default function PostsRouteGate() {
  const { homepageDisplayMode } = useAppState();

  if (homepageDisplayMode !== READING_DISPLAY_LATEST) {
    return <Navigate to="/pages" replace />;
  }

  return (
    <div style={{ padding: '20px' }}>Posts view coming soon</div>
  );
}
