import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ChatView from './ChatView/ChatView';
import { Settings } from './Settings/Settings';
import Header from './Header/Header';
import { OAuthCallback } from './Callback/OAuthCallback';
import { ThemeProvider } from '../contexts/ThemeContext';
import { McpProvider } from '../contexts/McpContext';
import { BotProvider } from '../contexts/BotContext';
import { TocProvider } from '../contexts/TocContext';

function NewChatRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/chat/id');
        const data = await res.json();
        navigate(`/chat/${data.id}`);
      } catch (err) {
        console.error('Failed to create chat', err);
      }
    })();
  }, [navigate]);
  return <div className="h-screen flex items-center justify-center">Loading...</div>;
}

export default function App() {

  return (
    <ThemeProvider>
      <McpProvider>
        <BotProvider>
        <TocProvider>
        <BrowserRouter>
          <div className='flex flex-col h-screen'>
            <Header />
            <div className='flex-1 overflow-x-hidden overflow-y-auto'>
              <Routes>
                <Route path="/" element={<NewChatRedirect />} />
                <Route path="/chat/:id" element={<ChatView />} />
                <Route path="/share/:id" element={<ChatView />} />
                <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
                <Route path="/settings/:section" element={<Settings />} />
                <Route path="/callback/:service" element={<OAuthCallback />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
        </TocProvider>
        </BotProvider>
      </McpProvider>
    </ThemeProvider>
  );
}
