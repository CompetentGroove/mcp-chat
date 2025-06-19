import { Chat, ChatRepository, ListChatsOptions, ListChatsResult } from '../../../../shared/types';
import { generateUniqueId } from '../../utils/chat';

const chatsByUser: Record<string, Chat[]> = {};

export class ChatMemoryRepository implements ChatRepository {
  private userPrefix: string;

  constructor(userPrefix?: string) {
    this.userPrefix = userPrefix || 'default';
    if (!chatsByUser[this.userPrefix]) {
      chatsByUser[this.userPrefix] = [];
    }
  }

  private get userChats(): Chat[] {
    return chatsByUser[this.userPrefix];
  }

  async getChat(id: string): Promise<Chat | null> {
    return this.userChats.find(c => c.id === id) || null;
  }

  async getOrCreateChat(id: string): Promise<Chat> {
    const existing = await this.getChat(id);
    if (existing) return existing;
    const newChat: Chat = {
      id,
      messages: [],
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString()
    };
    this.userChats.push(newChat);
    return newChat;
  }

  async listChats(options: ListChatsOptions = {}): Promise<ListChatsResult> {
    const { search = '', page = 1, limit = 10 } = options;
    let filtered = this.userChats;
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.messages.some(msg => {
          const text = typeof msg.content === 'string'
            ? msg.content
            : Array.isArray(msg.content)
              ? msg.content.filter(b => b?.type === 'text').map(b => b.text).join(' ')
              : '';
          return text.toLowerCase().includes(lower);
        })
      );
    }
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const chats = filtered
      .sort((a, b) => new Date(b.update_time).getTime() - new Date(a.update_time).getTime())
      .slice(startIndex, startIndex + limit);
    return { chats, total, page, limit };
  }

  async saveChat(chat: Chat): Promise<Chat> {
    chat.update_time = new Date().toISOString();
    if (!chat.id) {
      const existsCheck = async (id: string) => this.userChats.some(c => c.id === id);
      chat.id = await generateUniqueId(existsCheck);
    }
    const index = this.userChats.findIndex(c => c.id === chat.id);
    if (index !== -1) {
      this.userChats[index] = chat;
    } else {
      this.userChats.push(chat);
    }
    return chat;
  }

  async getChats(): Promise<Chat[]> {
    return this.userChats;
  }
}
