"use client";

import React, { useState } from "react";

export type Tag = {
  id: string;
  name: string;
  usage_count: number;
};

type TagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingTags: Tag[];
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagName: string) => void;
};

export function TagModal({
  isOpen,
  onClose,
  existingTags,
  selectedTags,
  onSelectTag,
  onRemoveTag,
}: TagModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  // usage_count順 Top50
  const topTags = existingTags
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 50);

  // 検索フィルタ
  const filteredTags = topTags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 w-[90%] max-w-3xl h-[60vh] bg-background text-foreground rounded-xl shadow-lg overflow-auto p-6 flex flex-col">
        {/* 検索バー */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タグを検索..."
          className="mb-4 w-full px-3 py-2 rounded border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* タグ一覧 */}
        <div className="flex flex-wrap gap-3">
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isSelected) {
                    onRemoveTag(tag.name);
                  } else {
                    onSelectTag(tag);
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition shadow-sm ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-blue-400 text-white hover:bg-blue-500"
                }`}
              >
                {tag.name} {isSelected ? "✓" : ""}
              </button>
            );
          })}
          {filteredTags.length === 0 && (
            <span className="text-gray-400 text-sm">タグがありません</span>
          )}
        </div>
      </div>
    </div>
  );
}
