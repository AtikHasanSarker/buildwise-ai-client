"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  loginWithGoogle,
  logoutUser,
  type User,
} from "./auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuthState() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await getCurrentUser();
        return res.data.data.user ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser({ email, password }),
    onSuccess: (res) => {
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => registerUser({ name, email, password }),
    onSuccess: (res) => {
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
    },
  });

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (res) => {
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginMutation.mutateAsync({ email, password });
      // Ensure cache is updated before caller navigates
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    [loginMutation, queryClient]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await registerMutation.mutateAsync({ name, email, password });
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    [registerMutation, queryClient]
  );

  const googleLogin = useCallback(
    async (idToken: string) => {
      const res = await googleMutation.mutateAsync(idToken);
      queryClient.setQueryData(["auth", "me"], res.data.data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    [googleMutation, queryClient]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    user: user ?? null,
    isLoading,
    login,
    register,
    loginWithGoogle: googleLogin,
    logout,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

let queryClient: QueryClient | null = null;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
