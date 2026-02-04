"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/context/UserContext";

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
            <UserProvider>
                {children}
            </UserProvider>
        </QueryClientProvider>
    );
}
