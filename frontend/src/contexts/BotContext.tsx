import React, { createContext, useContext, useState, useEffect } from 'react';
import { BotConfig } from '@shared/types';
import { getBots, saveBots } from '../utils/storage';

interface BotContextType {
  bots: BotConfig[];
  setBots: React.Dispatch<React.SetStateAction<BotConfig[]>>;
  selectedBot: string | undefined;
  setSelectedBot: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<BotConfig[]>(() => getBots());
  const [selectedBot, setSelectedBot] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = getBots();
    setBots(stored);
    if (!selectedBot && stored.length > 0) {
      setSelectedBot(stored[0].name);
    }
  }, []);

  useEffect(() => {
    saveBots(bots);
  }, [bots]);

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
