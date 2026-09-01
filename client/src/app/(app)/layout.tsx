"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenMenu={() => setDrawerOpen(true)} />

          <main className="flex flex-1 justify-center px-5 py-8 sm:px-8 sm:py-8">
            <div className="w-full max-w-[1200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
