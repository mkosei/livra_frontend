"use client";

import Image from "next/image";
import { useUser } from "@/contexts/UserContext";

export default function Profile() {
  const { currentUser } = useUser();

  if (!currentUser) return null;

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Image
        src={currentUser.avatarUrl}
        alt="avatar"
        width={80}
        height={80}
        className="rounded-full"
      />
      <h2 className="text-xl font-bold">{currentUser.name}</h2>
      <p className="text-gray-500">{currentUser.email}</p>
      {currentUser.bio && (
        <p className="text-sm text-gray-400 italic">{currentUser.bio}</p>
      )}
    </div>
  );
}
