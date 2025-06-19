import React, { createContext, useContext, useState, useEffect } from 'react';
import { BotConfig } from '@shared/types';


interface BotContextType {
  bots: BotConfig[];
  setBots: React.Dispatch<React.SetStateAction<BotConfig[]>>;
  selectedBot: string | undefined;
  setSelectedBot: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchBots() {
      try {
        const res = await fetch('/api/bots');
        if (res.ok) {
          const data = (await res.json()) as BotConfig[];
          setBots(data);
          if (!selectedBot && data.length > 0) {
            setSelectedBot(data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bots', err);
      }
    }
    fetchBots();
  }, []);

  return (
    <BotContext.Provider value={{ bots, setBots, selectedBot, setSelectedBot }}>
      {children}
    </BotContext.Provider>
  );
}

export function useBot() {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}
