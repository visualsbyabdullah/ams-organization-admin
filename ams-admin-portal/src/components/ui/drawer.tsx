"use client";

import {
  type ReactNode,
  useEffect,
} from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-border bg-surface shadow-2xl",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-5 border-b border-border px-6 py-5">
          <div>
            <h2
              id="drawer-title"
              className="text-xl font-bold tracking-tight"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm leading-6 text-text-muted">
                {description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            <X />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-border px-6 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
