'use client';

import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/SideBar";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* Show only sign-in page when user is not signed in */}
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          
          {/* Show admin layout only when user is signed in */}
          <SignedIn>
            <div className="flex h-screen bg-gray-50">
              <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={toggleSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                  <div className="p-6">
                    <Toaster position="top-right" />
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}