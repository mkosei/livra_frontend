"use client";

import { useEffect, useState } from "react";
import { TagModal } from "./TagModal";
import { Tag } from "./TagModal";

type Post = {
  id: string;
  title: string;
  content: string;
  user_id?: string | null;
  created_at?: string;
};


type EditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (post: Post) => void;
  initialTitle?: string;
  initialContent?: string;
};

export default function EditorModal({
  isOpen,
  onClose,
  onSaved,
  initialTitle = "",
  initialContent = "",
}: EditorModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const markdownButtons = [
    { label: "太字", icon: "B", type: "bold" },
    { label: "斜体", icon: "I", type: "italic" },
    { label: "見出し", icon: "H", type: "heading" },
    { label: "リスト", icon: "-", type: "list" },
    { label: "番号リスト", icon: "1.", type: "numberedList" },
    { label: "リンク", icon: "[ ]", type: "link" },
    { label: "コード", icon: "</>", type: "code" },
    { label: "引用", icon: "❝", type: "blockquote" },
];

//   useEffect(() => {
//   const fetchTags = async () => {
//     const { data, error } = await supabase.from("tags").select("*");
//     if (!error && data) setExistingTags(data);
//   };
//   fetchTags();
// }, []);



  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent, isOpen]);

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

const handleSave = async () => {
  setError(null);
  if (!title.trim()) {
    setError("タイトルを入力してください。");
    return;
  }
  setLoading(true);

  try {
    const token = localStorage.getItem("token"); // JWTをヘッダに
    const payload: Partial<Post> = { title: title.trim(), content };

    const res = await fetch(`${backend}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("投稿に失敗しました");
    const postData = await res.json();

    // タグはあとでAPIに送る、もしくはフロントで管理
    if (onSaved) onSaved(postData);

    // 初期化
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setTagInput("");
    onClose();
  } catch (e: any) {
    setError(e?.message || "予期せぬエラー");
  } finally {
    setLoading(false);
  }
};


  // const handleSave = async () => {
  //   setError(null);
  //   if (!title.trim()) {
  //     setError("タイトルを入力してください。");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const { data: authData } = await supabase.auth.getUser();
  //     const userId = authData?.user?.id ?? null;

  //     // 投稿作成
  //     const payload: Partial<Post> = { title: title.trim(), content };
  //     if (userId) payload.user_id = userId;

  //     const { data: postData, error: insertError } = await supabase
  //       .from("posts")
  //       .insert(payload)
  //       .select("*")
  //       .single();

  //     if (insertError || !postData) {
  //       setError(insertError?.message || "保存に失敗しました");
  //       setLoading(false);
  //       return;
  //     }

  //     const postId = postData.id;

  //     // タグ処理
  //     for (const tag of selectedTags) {
  //       let tagId = tag.id;
  //       if (!tagId) {
  //         // 新規タグ作成
  //         const { data: newTag, error: tagError } = await supabase
  //           .from("tags")
  //           .insert({ name: tag.name })
  //           .select("*")
  //           .single();
  //         if (tagError || !newTag) continue;
  //         tagId = newTag.id;
  //       }

  //       // 中間テーブルに挿入
  //       await supabase.from("post_tags").insert({ post_id: postId, tag_id: tagId });
  //     }

  //     if (onSaved) onSaved(postData);
  //     setTitle("");
  //     setContent("");
  //     setSelectedTags([]);
  //     setTagInput("");
  //     onClose();
  //   } catch (e: any) {
  //     setError(e?.message ?? "予期せぬエラー");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const applyMarkdown = async (
  type: "bold" | "italic" | "link" | "heading" | "list" | "numberedList" | "blockquote" | "horizontalRule" | "code"
) => {
  const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || "";

  let before = "";
  let after = "";
  let replacement = selected;

  switch (type) {
    case "bold":
      before = "**";
      after = "**";
      replacement = selected || "太字";
      break;
    case "italic":
      before = "*";
      after = "*";
      replacement = selected || "斜体";
      break;
    case "link":
      const url = prompt("リンクURLを入力してください");
      if (!url) return;
      replacement = `[${selected || "リンクテキスト"}](${url})`;
      break;
    case "heading":
      replacement = (selected || "見出し").split("\n").map(line => `# ${line}`).join("\n");
      break;
    case "list":
      replacement = (selected || "項目").split("\n").map(line => `- ${line}`).join("\n");
      break;
    case "numberedList":
      replacement = (selected || "項目").split("\n").map((line, idx) => `${idx + 1}. ${line}`).join("\n");
      break;
    case "blockquote":
      replacement = (selected || "引用文").split("\n").map(line => `> ${line}`).join("\n");
      break;
    case "code":
        before = "```ここに言語名\n";
        after = "\n```";
        replacement = selected || "コード";
      break;
  }

  const newText = textarea.value.slice(0, start) + before + replacement + after + textarea.value.slice(end);
  setContent(newText);

  // カーソル位置を更新
  const cursorStart = start + before.length;
  const cursorEnd = cursorStart + replacement.length;
  requestAnimationFrame(() => {
    textarea.setSelectionRange(cursorStart, cursorEnd);
    textarea.focus();
  });
};

const addTag = (tag: Tag) => {
  if (!selectedTags.find(t => t.name === tag.name)) setSelectedTags([...selectedTags, tag]);
};

const removeTag = (tagName: string) => {
  setSelectedTags(selectedTags.filter(t => t.name !== tagName));
};


const addNewTag = async (tagName: string) => {
  tagName = tagName.trim();
  if (!tagName) return;

  // すでに選択済みかチェック
  if (selectedTags.find(t => t.name === tagName)) return;

  // 既存タグにあるかチェック
  const existing = existingTags.find(t => t.name === tagName);
  if (existing) {
    setSelectedTags([...selectedTags, existing]);
  } else {
    // 新規タグは仮 id "" で追加しておく
    const newTag: Tag = { id: "", name: tagName, usage_count: 0 };
    setSelectedTags([...selectedTags, newTag]);
  }

  setTagInput("");
};




  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
      />

      {/* modal */}
      <div
        className="relative z-10 w-[94%] max-w-6xl h-[82vh] bg-background text-foreground rounded-xl shadow-lg overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">新しいメモを作成</h3>
            <span className="text-sm text-foreground/50">{charCount} 文字</span>
          </div>

          {/* ボタン群を右上に配置 */}
          <div className="flex gap-2">
            <button
              onClick={() => !loading && onClose()}
              className="px-4 py-1 rounded-full bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-60 transition"
            >
              キャンセル
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 transition"
            >
              {loading ? "保存中..." : "投稿"}
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 h-full">
            <input
              type="text"
              placeholder="タイトル（必須）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-foreground/10 rounded-md outline-none focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />

            <div className="flex gap-2 mb-2 items-center">
            <span className="text-sm text-gray-500 mr-2">テキストを選択してタップでMarkdownを適用:</span>

            {
              markdownButtons.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => applyMarkdown(btn.type as any)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500 text-white shadow hover:bg-blue-600 transition"
                  title={`${btn.label} (選択してタップ)`}
                >
                  <span className="font-semibold text-sm">{btn.icon}</span>
                  <span className="text-[12px]">{btn.label}</span>
                </button>
            ))}
            </div>

            <textarea
              id="content-textarea"
              placeholder="ここにメモを書く（プレーンテキスト / Markdownは後で表示時にレンダリングされます）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full min-h-[40vh] resize-none p-4 border border-foreground/10 rounded-md outline-none focus:ring-2 focus:ring-blue-300 font-sans leading-relaxed"
              disabled={loading}
            />

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* 新規タグ入力 */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Enterで改行防止
                      await addNewTag(tagInput);
                    }
                  }}
                  placeholder="新しいタグ"
                  className="border border-foreground/10 rounded px-2 py-0.5 text-xs w-20 outline-none focus:ring-2 focus:ring-blue-300"
                />

                {/* 選択済みタグ */}
                {selectedTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="flex items-center gap-1 bg-blue-400 text-white px-2 py-1 rounded-full text-xs"
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.name)}
                      className="text-white/80 hover:text-white font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {/* タグ一覧モーダルボタン */}
                <button
                  type="button"
                  onClick={() => setTagModalOpen(true)}
                  className="px-2 py-1 bg-blue-500 rounded-full text-white text-xs hover:bg-blue-600"
                >
                  既存タグから選ぶ
                </button>
              </div>
            </div>


            {tagModalOpen && (
            <TagModal
                isOpen={tagModalOpen}
                onClose={() => setTagModalOpen(false)}
                existingTags={existingTags}
                selectedTags={selectedTags}
                onSelectTag={addTag}
                onRemoveTag={removeTag}
            />
            )}

          </div>
        </div>

        {/* footer */}
        {error && (
          <div className="px-6 py-3 border-t border-foreground/10 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
