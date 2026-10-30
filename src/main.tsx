import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTelegram, tgUser } from './game/telegram';
import { installMockTelegram } from './game/mockTelegram';
import { initAudio } from './game/sound';
import { initAnalytics } from './game/analytics';
import './styles.css';

if (import.meta.env.DEV && location.search.includes('mockcloud')) installMockTelegram();
initTelegram();
initAudio();
const user = tgUser();
initAnalytics({ tgUserId: user?.id, platform: user ? 'telegram' : 'web', lang: user?.language_code });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
