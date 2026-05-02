import { createRoot } from 'react-dom/client';
import './i18n.js';
import App from './app/App.tsx';
import { PlatformDashboard } from './app/components/platform/PlatformDashboard.tsx';
import './styles/index.css';

const hash = window.location.hash.replace(/^#\/?/, '');
const showPlatformDashboard =
  hash === 'platform' ||
  hash.startsWith('platform/') ||
  hash === 'founder' ||
  hash.startsWith('founder/');

createRoot(document.getElementById('root')!).render(
  showPlatformDashboard ? <PlatformDashboard /> : <App />,
);
  