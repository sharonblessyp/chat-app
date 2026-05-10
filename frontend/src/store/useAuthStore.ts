import { create } from "zustand";
import toast from "react-hot-toast";
import { apiRequest, ApiError, getErrorMessage } from "../lib/api";
import type { AuthFormData, User } from "../types/chat";
import { io, type Socket } from "socket.io-client";

const BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "/";

type AuthState = {
  socket: Socket | null;
  onlineUsers: string[];
  authUser: User | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  checkAuth: () => Promise<void>;
  signup: (payload: AuthFormData) => Promise<void>;
  login: (payload: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profilePic: string) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
};

export const useAuthStore = create<AuthState>((set,get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const authUser = await apiRequest<User>("/auth/check-auth");
      set({ authUser });
      get().connectSocket();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        toast.error(getErrorMessage(error));
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (payload) => {
    set({ isSigningUp: true });

    try {
      const authUser = await apiRequest<User>("/auth/signup", {
        method: "POST",
        body: payload,
      });

      set({ authUser });
      toast.success("Account created successfully");
    
      get().connectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (payload) => {
    set({ isLoggingIn: true });

    try {
      const authUser = await apiRequest<User>("/auth/login", {
        method: "POST",
        body: payload,
      });
      
      set({ authUser });
      toast.success(`Welcome back, ${authUser.fullName}`);

      get().connectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
      set({ authUser: null });
      toast.success("Signed out");
      
      get().disconnectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  updateProfile: async (profilePic) => {
    set({ isUpdatingProfile: true });

    try {
      const authUser = await apiRequest<User>("/auth/update-profile", {
        method: "PUT",
        body: { profilePic },
      });

      set({ authUser });
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const {authUser} = get()
    if(!authUser || get().socket?.connected) return;
  
  console.log("Connecting to socket...")
  const socket = io(BASE_URL, {
    // this ensures cookies are sent with the connection 
    withCredentials: true,
  })

  socket.on("connect", () => {
    console.log("socket connected", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.log("socket connect_error", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", reason);
  });

  socket.connect();

  set({socket});

  // listen for online user events
  socket.on("getOnlineUsers", (users: string[]) => {
    set({onlineUsers: users})
  });
},

disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
    }
  },
}));
