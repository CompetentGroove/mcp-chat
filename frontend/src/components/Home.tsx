import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../utils/api';
import MessageInput from './MessageInput';
import { DEFAULT_BOT } from '../config';

interface HomeProps {
}


export default function Home({ }: HomeProps) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // New chat creation states
  const [newMessage, setNewMessage] = React.useState('');
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = React.useState(false);

  // Get the API utility for authenticated requests
  const api = useApi();

  // Handle creating a new chat with a message
  const handleNewChatWithMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsCreatingChat(true);

    try {
      // First, create a new chat ID using the authenticated API
      const { id } = await api.get('/api/chat/id');

      // Navigate to the new chat page
      navigate(`/chat/${id}`);

      // Store the message and bot in localStorage so ChatView can use it
      localStorage.setItem(`newChat_${id}_message`, content);
      localStorage.setItem(`newChat_${id}_bot`, DEFAULT_BOT.name);

      // The ChatView component will detect this and handle the streaming
    } catch (error) {
      console.error('Error creating chat with message:', error);
    } finally {
      setIsCreatingChat(false);
      setIsProcessingMessage(false);
      setNewMessage('');
    }
  };

  return (
    <div className={`h-full ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
      <main className="flex flex-col h-full justify-center">
        {/* Greeting */}
        <div className={`w-full max-w-3xl mx-auto mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <h1 className="text-4xl mb-2">Welcome.</h1>
          <p className="text-2xl text-gray-500">How can I help you today?</p>
        </div>
        {/* New Chat Input */}
				<div className={`py-4`}>
					{/* Assistant Avatar */}
                                        <MessageInput
                                                message={newMessage}
                                                setMessage={setNewMessage}
                                                isLoading={isCreatingChat || isProcessingMessage}
                                                handleSubmit={async () => Promise.resolve()} // Not used since we're using onSendMessage
                                                onSendMessage={handleNewChatWithMessage}
                                                isFixed={false} // Don't fix this input to the bottom of the screen
                                        />
                                </div>

      </main>
    </div>
  );
}
