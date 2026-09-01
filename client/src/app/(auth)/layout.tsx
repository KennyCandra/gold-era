"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-[400px]"
      >
        {children}
      </motion.div>
    </div>
  );
}
