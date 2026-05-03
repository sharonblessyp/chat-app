import { create } from "zustand";
import toast from "react-hot-toast";
import { apiRequest, getErrorMessage } from "../lib/api";
import type { ChatPreview, Message, User } from "../types/chat";

type SendMessagePayload = {
  text?: string;
  image?: string;
};

type ChatState = {
  contacts: User[];
  chats: ChatPreview[];
  messages: Message[];
  selectedContact: User | null;
  isContactsLoading: boolean;
  isChatsLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;
  getContacts: () => Promise<void>;
  getChats: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedContact: (contact: User | null) => void;
  sendMessage: (receiverId: string, payload: SendMessagePayload) => Promise<void>;
  resetChat: () => void;
};

const updateChatPreviewList = (
  chats: ChatPreview[],
  contact: User,
  lastMessage: Message,
) => {
  const filteredChats = chats.filter((chat) => chat.contact._id !== contact._id);

  return [{ contact, lastMessage }, ...filteredChats];
};

export const useChatStore = create<ChatState>((set, get) => ({
  contacts: [],
  chats: [],
  messages: [],
  selectedContact: null,
  isContactsLoading: false,
  isChatsLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getContacts: async () => {
    set({ isContactsLoading: true });

    try {
      const contacts = await apiRequest<User[]>("/messages/contacts");
      set({ contacts });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isContactsLoading: false });
    }
  },

  getChats: async () => {
    set({ isChatsLoading: true });

    try {
      const chats = await apiRequest<ChatPreview[]>("/messages/chats");
      set({ chats });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isChatsLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      const messages = await apiRequest<Message[]>(`/messages/chats/${userId}`);
      set({ messages });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedContact: (selectedContact) => {
    set({ selectedContact, messages: [] });
  },

  sendMessage: async (receiverId, payload) => {
    const selectedContact = get().selectedContact;
    if (!selectedContact) {
      return;
    }

    set({ isSendingMessage: true });

    try {
      const message = await apiRequest<Message>(`/messages/send/${receiverId}`, {
        method: "POST",
        body: payload,
      });

      set((state) => ({
        messages: [...state.messages, message],
        chats: updateChatPreviewList(state.chats, selectedContact, message),
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  resetChat: () => {
    set({
      contacts: [],
      chats: [],
      messages: [],
      selectedContact: null,
      isContactsLoading: false,
      isChatsLoading: false,
      isMessagesLoading: false,
      isSendingMessage: false,
    });
  },
}));
