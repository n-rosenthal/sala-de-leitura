"use client";

import { useRouter } from "next/navigation";

export function useLogout() {
    const router = useRouter();

    async function logout() {
        await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`,
        {
            method: "POST",
            credentials: "include",
        }
        );

        router.replace("/login");
        router.refresh();
    }

    return { logout };
}
