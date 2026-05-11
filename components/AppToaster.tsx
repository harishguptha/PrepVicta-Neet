"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return <Toaster position="top-right" duration={2000} richColors closeButton />;
}
