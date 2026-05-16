/**
 * Client-side auth session for POS login, registration, and forgot-MPIN (demo persistence).
 * MPIN defaults to the last four digits of the registered mobile until a real API replaces this.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'pos-auth-session';

/** Keeps up to 10 trailing digits for matching and MPIN derivation. */
export function normalizeMobileDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(-10);
}

/** Demo default MPIN: last four digits of the mobile (left-padded if needed). */
export function deriveDefaultMpin(mobileDigits: string): string {
  const d = mobileDigits.replace(/\D/g, '');
  if (d.length === 0) return '0000';
  return d.slice(-4).padStart(4, '0').slice(-4);
}

export type UserAccountStatus = 'active' | 'inactive';

export type SubscriptionPlanId = 'starter' | 'pro' | 'business';

interface AuthSessionState {
  isAuthenticated: boolean;
  mobileDigits: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  userName: string;
  email: string;
  accountStatus: UserAccountStatus;
  activePlanId: SubscriptionPlanId;
  subscriptionEndDate: string;
  mpin: string;
  loginWithMpin: (mobileDigits: string, mpin: string) => boolean;
  registerNewUser: (mobileDigits: string, shopName: string) => void;
  isRegisteredMobile: (mobileDigits: string) => boolean;
  hasCompleteAccount: () => boolean;
  updateUserProfile: (patch: { userName?: string; email?: string }) => void;
  updateShopInfo: (patch: { shopName?: string; shopAddress?: string; shopPhone?: string }) => void;
  setActivePlan: (planId: SubscriptionPlanId) => void;
  /** Called after forgot-flow OTP success; resets MPIN to the default derived from mobile. */
  completeForgotMpin: (mobileDigits: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthSessionState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      mobileDigits: '',
      shopName: '',
      shopAddress: '',
      shopPhone: '',
      userName: '',
      email: '',
      accountStatus: 'active' as UserAccountStatus,
      activePlanId: 'pro' as SubscriptionPlanId,
      subscriptionEndDate: '2026-12-31',
      mpin: '',

      hasCompleteAccount: () => {
        const { mobileDigits, mpin } = get();
        return mobileDigits.length === 10 && mpin.length === 4;
      },

      isRegisteredMobile: (mobileDigits) => {
        const normalized = normalizeMobileDigits(mobileDigits);
        return normalized.length === 10 && get().mobileDigits === normalized;
      },

      loginWithMpin: (mobileDigits, mpin) => {
        const normalizedMobile = normalizeMobileDigits(mobileDigits);
        if (normalizedMobile.length !== 10 || mpin.length !== 4) {
          return false;
        }
        const state = get();
        if (!state.hasCompleteAccount()) {
          return false;
        }
        if (state.mobileDigits !== normalizedMobile || state.mpin !== mpin) {
          return false;
        }
        set({ isAuthenticated: true });
        return true;
      },

      registerNewUser: (mobileDigits, shopName) => {
        const normalized = normalizeMobileDigits(mobileDigits);
        const trimmedName = shopName.trim();
        set({
          isAuthenticated: true,
          mobileDigits: normalized,
          shopName: trimmedName,
          shopAddress: '',
          shopPhone: '',
          userName: '',
          email: '',
          accountStatus: 'active',
          activePlanId: 'starter',
          subscriptionEndDate: '',
          mpin: deriveDefaultMpin(normalized),
        });
      },

      updateUserProfile: (patch) => {
        set((state) => ({
          userName: patch.userName !== undefined ? patch.userName.trim() : state.userName,
          email: patch.email !== undefined ? patch.email.trim() : state.email,
        }));
      },

      updateShopInfo: (patch) => {
        set((state) => ({
          shopName: patch.shopName !== undefined ? patch.shopName.trim() : state.shopName,
          shopAddress:
            patch.shopAddress !== undefined ? patch.shopAddress.trim() : state.shopAddress,
          shopPhone: patch.shopPhone !== undefined ? patch.shopPhone.trim() : state.shopPhone,
        }));
      },

      setActivePlan: (planId) => {
        const end = new Date();
        end.setFullYear(end.getFullYear() + 1);
        set({
          activePlanId: planId,
          subscriptionEndDate: end.toISOString().slice(0, 10),
        });
      },

      completeForgotMpin: (mobileDigits) => {
        const normalized = normalizeMobileDigits(mobileDigits);
        if (!get().isRegisteredMobile(normalized)) {
          return false;
        }
        set({ mpin: deriveDefaultMpin(normalized), isAuthenticated: false });
        return true;
      },

      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        mobileDigits: s.mobileDigits,
        shopName: s.shopName,
        shopAddress: s.shopAddress,
        shopPhone: s.shopPhone,
        userName: s.userName,
        email: s.email,
        accountStatus: s.accountStatus,
        activePlanId: s.activePlanId,
        subscriptionEndDate: s.subscriptionEndDate,
        mpin: s.mpin,
      }),
    },
  ),
);
