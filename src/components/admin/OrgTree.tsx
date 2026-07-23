"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, FolderTree, RefreshCw, Users } from "lucide-react";

export interface OrgNode {
  id: string;
  label: string;
  count?: number;
  children?: OrgNode[];
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: OrgNode;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;
  const active = selectedId === node.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setOpen((v) => !v);
        }}
        className={`group flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm transition-colors ${
          active ? "bg-[var(--brand-tint)] font-semibold text-[var(--brand-strong)]" : "text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
        }`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown size={14} className="shrink-0 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight size={14} className="shrink-0 text-[var(--text-muted)]" />
          )
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {depth === 0 ? (
          <Building2 size={15} className="shrink-0 text-[var(--brand-strong)]" />
        ) : hasChildren ? (
          <FolderTree size={15} className="shrink-0 text-[var(--text-muted)]" />
        ) : (
          <Users size={15} className="shrink-0 text-[var(--text-muted)]" />
        )}
        <span className="truncate">{node.label}</span>
        {typeof node.count === "number" && (
          <span className="ml-auto rounded-full bg-[var(--hover-tint)] px-1.5 text-[11px] font-medium text-[var(--text-muted)]">
            {node.count}
          </span>
        )}
      </button>
      {hasChildren && open && (
        <div>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgTree({
  tree,
  selectedId,
  onSelect,
  onRefresh,
}: {
  tree: OrgNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: "var(--line)" }}>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
          <FolderTree size={16} className="text-[var(--brand-strong)]" />
          โครงสร้างองค์กร
        </span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-tint)] hover:text-[var(--ink)]"
            aria-label="รีเฟรชโครงสร้างองค์กร"
          >
            <RefreshCw size={15} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tree.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
