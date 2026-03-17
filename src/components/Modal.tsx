"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elRef.current) {
      elRef.current = document.createElement("div");
    }
    const el = elRef.current;
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !elRef.current) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="bg-[#0a0a0a] border border-border rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-base font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border flex-shrink-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    elRef.current
  );
}
