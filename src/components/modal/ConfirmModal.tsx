import React, { useState, createContext, useContext, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle, Info, X } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
  showIcon?: boolean;
  showClose?: boolean;
}

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

interface ConfirmProviderProps {
  children: React.ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleCancel = () => {
    if (resolverRef.current) {
      resolverRef.current(false);
    }
    setOptions(null);
  };

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(true);
    }
    setOptions(null);
  };

  const getIcon = () => {
    switch (options?.type) {
      case "danger":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (options?.type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-md shadow-red-600/10";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white shadow-md shadow-amber-500/10";
      default:
        return "bg-accent-600 hover:bg-accent-700 focus:ring-accent-500 text-white shadow-md shadow-accent-600/10";
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options &&
        createPortal(
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
              onClick={handleCancel}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
              {/* Close Button */}
              {options.showClose !== false && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-sand-400 hover:bg-sand-50 hover:text-sand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sand-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <div className="flex items-start gap-4">
                {options.showIcon !== false && getIcon()}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-sand-900 leading-6">
                    {options.title}
                  </h3>
                  <p className="mt-2 text-sm text-sand-500 whitespace-pre-line leading-relaxed">
                    {options.message}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-semibold text-sand-700 transition-all hover:bg-sand-50 focus:outline-none focus:ring-2 focus:ring-sand-200 focus:ring-offset-2"
                >
                  {options.cancelText || "Hủy"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${getConfirmButtonClass()}`}
                >
                  {options.confirmText || "Xác nhận"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}
