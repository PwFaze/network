// Layout.tsx (Client Component)
"use client";

import { AuthProvider } from "@/context/AuthProvider";
import { ChatProvider } from "@/context/ChatProvider";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ChatProvider>
    </AuthProvider>
  );
}
