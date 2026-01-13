"use client";

import { X } from "lucide-react";

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerClass?: string;
  children: React.ReactNode;
};

export default function BaseModal({
  open,
  onClose,
  title,
  subtitle,
  headerClass = "bg-gradient-to-r from-slate-600 to-slate-700",
  children
}: BaseModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div
          className={`${headerClass} p-6 text-white rounded-t-2xl`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {title}
              </h2>
              {subtitle && (
                <p className="text-white/80">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
