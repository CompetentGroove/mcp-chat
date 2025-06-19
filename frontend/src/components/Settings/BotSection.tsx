import React, { useState, useRef, useEffect } from 'react';
import { BotConfig, McpServerConfig } from '../../../../shared/types';
import { BotFormModal } from './BotForm';
import { ConfirmationDialog } from './Confirm';
import { ActionMenu } from './ActionMenu';
import { saveBots, getMcpServers } from '../../utils/storage';
import { useBot } from '../../contexts/BotContext';

interface BotSectionProps {
  isDarkMode: boolean;
  setStatusMessage: (message: {type: 'success' | 'error', text: string} | null) => void;
}

export const BotSection: React.FC<BotSectionProps> = ({
  isDarkMode,
  setStatusMessage
}) => {
  // Bot form modal state
  const [isBotFormOpen, setIsBotFormOpen] = useState(false);
  const { bots, setBots } = useBot();
  const [selectedBot, setSelectedBot] = useState<BotConfig | undefined>(undefined);

  // Confirmation dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);

  // Action menu state
  const [actionMenuBot, setActionMenuBot] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Local storage state
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>([]);

  useEffect(() => {
    setMcpServers(getMcpServers());
  }, []);

  // Handle bot form submission
  const handleBotSubmit = async (bot: BotConfig) => {
    try {
      const updated = [...bots];
      if (selectedBot) {
        const idx = updated.findIndex(b => b.name === selectedBot.name);
        if (idx !== -1) {
          updated[idx] = bot;
        }
        setStatusMessage({ type: 'success', text: `Bot "${bot.name}" updated successfully` });
      } else {
        updated.push(bot);
        setStatusMessage({ type: 'success', text: `Bot "${bot.name}" added successfully` });
      }
      setBots(updated);
      saveBots(updated);
      setIsBotFormOpen(false);
      setSelectedBot(undefined);
    } catch (error) {
      console.error('Error saving bot:', error);
      setStatusMessage({ type: 'error', text: `Failed to save bot: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  // Handle bot deletion
  const handleDeleteBot = async () => {
    if (!botToDelete) return;

    try {
      const updated = bots.filter(b => b.name !== botToDelete);
      setBots(updated);
      saveBots(updated);
      setStatusMessage({ type: 'success', text: `Bot deleted successfully` });
    } catch (error) {
      console.error('Error deleting bot:', error);
      setStatusMessage({ type: 'error', text: `Failed to delete bot: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }

    setBotToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  // Open edit form for a bot
  const handleEditBot = (bot: BotConfig) => {
		console.log("handleEditBot", bot);
    setSelectedBot(bot);
    setIsBotFormOpen(true);
  };

  // Open delete confirmation for a bot
  const handleDeleteConfirm = (botName: string) => {
    setBotToDelete(botName);
    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="mb-12">
      {/* Bot form modal */}
      <BotFormModal
        isOpen={isBotFormOpen}
        onClose={() => {
          setIsBotFormOpen(false);
          setSelectedBot(undefined);
        }}
        onSubmit={handleBotSubmit}
        initialBot={selectedBot}
        mcpServers={mcpServers}
        isDarkMode={isDarkMode}
      />

      {/* Confirmation dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleDeleteBot}
        title="Delete Bot"
        message={`Are you sure you want to delete this bot? This action cannot be undone.`}
        isDarkMode={isDarkMode}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl sm:text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:hidden`}>Bots</h2>
        <h2 className={`hidden sm:block text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bots</h2>
        <button
          onClick={() => {
            setSelectedBot(undefined);
            setIsBotFormOpen(true);
          }}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md text-sm sm:text-base`}
        >
          Add Bot
        </button>
      </div>

      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 text-sm sm:text-base`}>Manage your bot configurations</p>

      <div className={`${isDarkMode ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
        {bots && bots.length > 0 ? (
          bots.map((bot, index) => (
          <div key={bot.name} className={`${index !== bots.length - 1 ? isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200' : ''} p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bot.name}</h3>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{bot.model} {bot.mcp_servers && bot.mcp_servers.length > 0 && `• MCPs: ${bot.mcp_servers.join(', ')}`}</span>
                </div>
              </div>
              <div className="relative" ref={actionMenuBot === bot.name ? actionMenuRef : undefined}>
                <button
                  onClick={() => setActionMenuBot(actionMenuBot === bot.name ? null : bot.name)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>

                {actionMenuBot === bot.name && (
                  <ActionMenu
                    isOpen={true}
                    onClose={() => setActionMenuBot(null)}
                    onEdit={() => handleEditBot(bot)}
                    onDelete={() => handleDeleteConfirm(bot.name)}
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="p-4 text-center">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No bot configurations found</div>
          </div>
        )}
      </div>
    </div>
  );
};
