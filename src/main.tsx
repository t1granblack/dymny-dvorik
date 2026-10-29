import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTelegram } from './game/telegram';
import { installMockTelegram } from './game/mockTelegram';
import { initAudio } from './game/sound';
import './styles.css';

if (import.meta.env.DEV && location.search.includes('mockcloud')) installMockTelegram();
initTelegram();
initAudio();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
