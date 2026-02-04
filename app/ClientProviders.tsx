"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/context/UserContext";

import { ToastProvider } from "@/context/ToastContext";

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <UserProvider>
                    {children}
                </UserProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
}
