"use client";

import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GoogleLoginModal from "@/components/LoginModal";
import EditorModal from "@/components/EditorModal";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import Profile from "@/components/ProfilePage";
import Welcome from "@/components/WelcomePage";
import debounce from "lodash.debounce";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

type Post = {
  id: string;
  title: string;
  content: string;
  user_id?: string;
};
type PostSummary = Pick<Post, "id" | "title">;

type Pagination = {
  page: number;
  totalPages: number;
};

// ✅ コードブロックコンポーネント
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative my-6 group">
      {/* コピー ボタン */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-slate-700 text-slate-200 opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      {/* ハイライト */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          background: "#1e293b", // Tailwind slate-900
          borderRadius: "0.5rem",
          padding: "1rem",
        }}
        codeTagProps={{
          style: {
            background: "none",
            fontSize: "0.875rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          },
        }}
        className="overflow-x-auto text-sm"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState("");
  const [myNotesMode, setMyNotesMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // const [pagination, setPagination] = useState<Pagination>();

  const { currentUser, setCurrentUser } = useUser();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  // --- 非同期 API 呼び出し ---
  const fetchPosts = async (
    search: string,
    myNotesMode: boolean,
    userId?: string,
    page = 0
  ) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (myNotesMode && userId) query.set("user_id", userId);
    query.set("page", page.toString());
    query.set("pageSize", "50");

    const res = await fetch(`${backend}/posts?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch posts");

    return (await res.json()) as {
      posts: PostSummary[];
      totalPages: number;
      currentPage: number;
    };
  };

  const loadPost = async (id: string) => {
    try {
      console.log("Loading post:", id);
      const res = await fetch(`${backend}/posts/${id}`);
      if (!res.ok) throw new Error("投稿の取得に失敗");
      const data = (await res.json()) as Post;
      setSelectedPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedSearch = useMemo(() => {
    return debounce(async (q: string, notesMode: boolean, userId?: string, page = 0) => {
      try {
        const data = await fetchPosts(q, notesMode, userId, page);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setPage(data.currentPage);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (search || myNotesMode) {
      debouncedSearch(search, myNotesMode, currentUser?.id);
    } else {
      setPosts([]);
    }
  }, [search, myNotesMode, currentUser?.id]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // --- UI ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsOpen(false);
  };

  const handleSaved = (post: any) => {
    setPosts((prev) => [post, ...prev]);
    setSelectedPost(post);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-foreground/10">
        <h1 className="text-xl font-bold">Livra</h1>
        <div className="flex gap-3 items-center">
          {currentUser ? (
            <>
              <button
                onClick={() => setOpenEditor(true)}
                className="px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                投稿する
              </button>

              <EditorModal
                isOpen={openEditor}
                onClose={() => setOpenEditor(false)}
                onSaved={handleSaved}
              />

              <button
                onClick={() => {
                  setMyNotesMode(!myNotesMode);
                  setSearch("");
                  setPosts([]);
                  setSelectedPost(null);
                }}
                className="px-3 py-1 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition"
              >
                {myNotesMode ? "みんなのメモ" : "自分のメモ"}
              </button>

              <div className="relative">
                <Image
                  src={currentUser.avatarUrl}
                  alt="user"
                  width={36}
                  height={36}
                  className="rounded-full cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                />
                {isOpen && (
                  <>
                    <div
                      className="absolute right-0 top-full mt-2 w-36 bg-blue-500 rounded shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-white hover:bg-blue-600 transition rounded-t"
                      >
                        ログアウト
                      </button>
                    </div>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsOpen(false)}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <GoogleLoginModal triggerText="ログイン" />
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 divide-x divide-foreground/10">
        {/* Sidebar */}
        <aside className="w-[25%] p-4 flex flex-col">
          <input
            type="text"
            placeholder={myNotesMode ? "自分のメモを検索..." : "検索..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-foreground/10 rounded mb-4 focus:ring-2 focus:ring-blue-300 outline-none"
          />
          <div className="flex-1 overflow-y-auto space-y-1">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={async () => {
                  await loadPost(post.id);
                }}
                className="block text-left font-bold w-full p-2 rounded hover:bg-blue-500"
              >
                {post.title}
              </button>
            ))}
          </div>

          {/* Pagination */}
          {search || myNotesMode ? (
            <div className="flex justify-center items-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1))
                .map((i, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev !== undefined && i - prev > 1;
                  return (
                    <span key={i} className="flex items-center">
                      {showEllipsis && <span className="px-2">…</span>}
                      <button
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          page === i
                            ? "bg-blue-500 text-white"
                            : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    </span>
                  );
                })}
            </div>
          ) : null}
        </aside>

        {/* Content */}
        <main className="w-[75%] p-6 overflow-y-auto">
          {selectedPost ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match) {
                    return (
                      <CodeBlock
                        code={String(children).replace(/\n$/, "")}
                        language={match[1]}
                      />
                    );
                  }
                  return (
                    <code className="bg-slate-800 text-pink-400 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },

                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mt-12 mb-6 leading-tight" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-semibold mt-10 mb-5 border-b border-slate-600 pb-1 leading-snug" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mt-8 mb-4 leading-snug" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="my-4 leading-relaxed text-base" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-400 hover:underline break-words" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-slate-500 pl-4 italic my-6 bg-slate-800 text-white" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-8 my-4 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-8 my-4 space-y-1" {...props} />
                ),
                img: ({ node, ...props }) => (
                  <img className="max-w-full rounded-lg my-6 mx-auto shadow-sm" {...props} />
                ),
                hr: ({ node, ...props }) => <hr className="my-8 border-slate-600" {...props} />,
              }}
            >
              {selectedPost.content}
            </ReactMarkdown>
          ) : myNotesMode ? (
            <Profile />
          ) : (
            <Welcome />
          )}
        </main>
      </div>
    </div>
  );
}
