/**
 *  `frontend/app/(protected)/page.tsx`, componente `/`
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/me");
  }, [router]);

  return null;
}
