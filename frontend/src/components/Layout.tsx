// Layout.tsx (Client Component)
"use client";

import { AuthProvider } from "@/context/AuthProvider";
import { ChatProvider } from "@/context/ChatProvider";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <ChatProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Toaster position="top-center" />
            {children}
          </Suspense>
        </ChatProvider>
      </AuthProvider>
    </>
  );
}
