"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { UserProfile } from "@/lib/types";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AudioControls } from "@/components/shared/AudioControls";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ChainSelector } from "@/components/shared/ChainSelector";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  isAuthenticated: boolean;
  user: { id: string; email?: string } | null;
  displayName: string | null;
  signOut: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  profile,
  isAuthenticated,
  user,
  displayName,
  signOut,
  onLoginClick,
  onSignupClick,
}: MobileMenuProps) {
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Focus the drawer when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => drawerRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleNavClick = () => {
    onClose();
  };

  if (typeof window === "undefined") return null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {t('nav.menu')}
              </span>
              <button
                onClick={onClose}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t('nav.closeMenu')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {[
                { href: "/", label: t('nav.home') },
                { href: "/leaderboard", label: t('nav.leaderboard') },
                { href: "/profile/me", label: t('nav.profile') },
                { href: "/about", label: t('nav.guide') },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="block px-4 py-3 min-h-[44px] text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Separator */}
            <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />

            {/* Chain Selector & Wallet */}
            <div className="p-4 space-y-3">
              <ChainSelector className="w-full" />
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>

            {/* Stats */}
            {profile.gamesPlayed > 0 && (
              <>
                <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />
                <div className="p-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('points')}:</span>{" "}
                      <span className="font-bold text-gray-900 dark:text-white">{profile.totalPoints}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('gamesLabel')}:</span>{" "}
                      <span className="font-bold text-gray-900 dark:text-white">{profile.gamesPlayed}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Separator */}
            <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />

            {/* Auth Section */}
            <div className="p-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => { onLoginClick(); onClose(); }}
                    className="w-full px-4 py-3 min-h-[44px] bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    {t('auth.login')}
                  </button>
                  <button
                    onClick={() => { onSignupClick(); onClose(); }}
                    className="w-full px-4 py-3 min-h-[44px] font-semibold text-sm rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--chain-primary)", color: "var(--chain-contrast)" }}
                  >
                    {t('auth.createAccount')}
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                    {displayName || user?.email?.split("@")[0] || t('nav.profile')}
                  </div>
                  <Link
                    href="/profile/me"
                    onClick={handleNavClick}
                    className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={handleNavClick}
                    className="block px-4 py-3 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {t('edit')}
                  </Link>
                  <button
                    onClick={() => { signOut(); onClose(); }}
                    className="w-full text-left px-4 py-3 min-h-[44px] text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              )}
            </div>

            {/* Separator */}
            <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />

            {/* Controls */}
            <div className="p-4 flex items-center gap-3">
              <ThemeToggle size="sm" />
              <AudioControls size="sm" />
              <LanguageSwitcher />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
