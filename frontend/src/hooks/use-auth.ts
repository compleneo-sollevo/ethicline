"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { setToken } from "@/lib/auth";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Token,
  TwoFactorSetupResponse,
  TwoFactorEnableResponse,
  User,
} from "@/types/api";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => api.post<LoginResponse>("/api/v1/auth/login", data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.post<LoginResponse>("/api/v1/auth/register", data),
  });
}

export function useVerify2fa() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: { temp_token: string; code: string }) =>
      api.post<Token>("/api/v1/auth/login/verify-2fa", data),
    onSuccess: (data) => {
      setToken(data.access_token);
    },
  });
}

export function useMfaSetup() {
  return useMutation({
    mutationFn: (data: { temp_token: string; code: string }) =>
      api.post<TwoFactorSetupResponse>("/api/v1/auth/mfa/setup", data),
  });
}

export function useMfaEnable() {
  return useMutation({
    mutationFn: (data: { temp_token: string; code: string }) =>
      api.post<TwoFactorEnableResponse>("/api/v1/auth/mfa/enable", data),
    onSuccess: (data) => {
      setToken(data.access_token);
    },
  });
}

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = await api.get<User>("/api/v1/auth/me");
      setUser(user);
      return user;
    },
    retry: false,
  });
}
