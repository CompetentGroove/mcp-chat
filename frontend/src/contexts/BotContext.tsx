import React, { createContext, useContext, useState } from 'react';
import { BotConfig } from '@shared/types';
import { DEFAULT_BOT } from '../config';


interface BotContextType {
  bots: BotConfig[];
  setBots: React.Dispatch<React.SetStateAction<BotConfig[]>>;
  selectedBot: string | undefined;
  setSelectedBot: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [bots, setBots] = useState<BotConfig[]>([DEFAULT_BOT]);
  const [selectedBot, setSelectedBot] = useState<string | undefined>(DEFAULT_BOT.name);

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
