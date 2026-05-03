import { create } from "zustand";
import toast from "react-hot-toast";
import { apiRequest, ApiError, getErrorMessage } from "../lib/api";
import type { AuthFormData, User } from "../types/chat";

type AuthState = {
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
};

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const authUser = await apiRequest<User>("/auth/check-auth");
      set({ authUser });
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
}));
