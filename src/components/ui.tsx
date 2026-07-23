"use client";

import { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h3 className="text-xl font-bold text-[var(--ink)]">{title}</h3>
        {subtitle && <div className="text-sm text-[var(--text-muted)]">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border rounded-xl shadow-sm ${className}`} style={{ borderColor: "var(--line)" }}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: "var(--line)" }}>
      {children}
    </div>
  );
}

const badgeColors: Record<string, string> = {
  success: "bg-[#e5f5ec] text-[#14683c]",
  danger: "bg-[#fdeaea] text-[#a02121]",
  warning: "bg-[#fbf3dd] text-[#8a6116]",
  secondary: "bg-[var(--hover-tint)] text-[var(--ink-soft)]",
  primary: "bg-[#e8ebf5] text-[#33406e]",
  info: "bg-[#e3f1f7] text-[#1f5a74]",
};

export function Badge({ tone, children }: { tone: keyof typeof badgeColors; children: ReactNode }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColors[tone]}`}>
      {children}
    </span>
  );
}

export function Alert({ tone, children }: { tone: "success" | "danger" | "info"; children: ReactNode }) {
  const styles = {
    success: "bg-[#e5f5ec] border-[#cdeadb] text-[#14683c]",
    danger: "bg-[#fdeaea] border-[#f6d4d4] text-[#a02121]",
    info: "bg-[#e3f1f7] border-[#cfe6f0] text-[#1f5a74]",
  };
  return <div className={`border rounded-md px-3 py-2 mb-4 text-sm ${styles[tone]}`}>{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "danger" | "outline-danger" | "success";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-[var(--ink)] text-white hover:bg-black",
    outline: "border text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]",
    danger: "bg-[#b91c1c] text-white hover:bg-[#991717]",
    "outline-danger": "border text-[#a02121] hover:bg-[#fdeaea]",
    success: "bg-[#1a7f4b] text-white hover:bg-[#166b3f]",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={variant === "outline" || variant === "outline-danger" ? { borderColor: "var(--line-strong)" } : {}}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-[var(--ink)] text-white hover:bg-black",
    outline: "border text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]",
  };
  return (
    <a href={href} className={`${base} ${variants[variant]}`} style={variant === "outline" ? { borderColor: "var(--line-strong)" } : {}}>
      {children}
    </a>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-soft)]/20 ${props.className ?? ""}`}
      style={{ borderColor: "var(--line-strong)" }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-soft)]/20 ${props.className ?? ""}`}
      style={{ borderColor: "var(--line-strong)" }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-soft)]/20 ${props.className ?? ""}`}
      style={{ borderColor: "var(--line-strong)" }}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">{children}</label>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto bg-white border rounded-xl" style={{ borderColor: "var(--line)" }}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
