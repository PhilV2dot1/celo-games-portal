"use client";

import { useMiniPayContext } from "@/components/providers";

interface ExplorerLinkProps {
  href: string;
  label: string;
  className?: string;
}

/**
 * Explorer link that hides itself inside MiniPay WebView.
 * MiniPay does not support target="_blank" and opening Celoscan
 * in the same WebView would navigate away from the game.
 */
export function ExplorerLink({ href, label, className }: ExplorerLinkProps) {
  const { isInMiniPay } = useMiniPayContext();

  if (isInMiniPay) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
