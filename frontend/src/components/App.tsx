import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ChatView from './ChatView/ChatView';
import Header from './Header/Header';
import { ThemeProvider } from '../contexts/ThemeContext';
import { McpProvider } from '../contexts/McpContext';
import { BotProvider } from '../contexts/BotContext';
import { TocProvider } from '../contexts/TocContext';

function NewChatRedirect() {
  const navigate = useNavigate();

  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const createChat = async () => {
      try {
        const res = await fetch('/api/chat/id');
        const data = await res.json();
        if (!cancelled) {
          navigate(`/chat/${data.id}`);
        }
      } catch (err) {
        console.error('Failed to create chat', err);
        setError(true);
        setTimeout(createChat, 2000); // retry after delay
      }
    };

    createChat();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      {error ? 'Connecting to server…' : 'Loading...'}
    </div>
  );
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
