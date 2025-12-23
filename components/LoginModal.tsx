"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { jwtDecode } from "jwt-decode";


type GoogleLoginModalProps = {
  triggerText?: string;
};

export default function GoogleLoginModal({ triggerText = "ログイン" }: GoogleLoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);

   const { setCurrentUser } = useUser();

   const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  // Googleログイン成功時
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await axios.post(`${backend}/auth/google`, { token: idToken });

      localStorage.setItem("token", res.data.access_token);

      const decoded: any = jwtDecode(res.data.access_token);
      console.log(decoded)
      setCurrentUser({ id: decoded.sub, email: decoded.email, name: decoded.name, bio: decoded.bio, avatarUrl: decoded.avatarUrl });

      setIsOpen(false);
    } catch (err) {
      console.error("ログイン失敗:", err);
    }
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        className="px-4 py-2 rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 transition"
        onClick={() => setIsOpen(true)}
      >
        {triggerText}
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-background p-6 rounded-lg shadow-lg w-[320px] flex flex-col gap-4">
            <h2 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
              Googleでログイン
            </h2>

            {/* Googleログインボタン */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("ログイン失敗")}
              />
            </div>

            {/* キャンセル */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition self-center"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  );
}
