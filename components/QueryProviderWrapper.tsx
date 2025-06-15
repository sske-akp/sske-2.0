"use client";
import { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Props = {
    children: React.ReactNode;
    initialState?: unknown;
};

export default function QueryProviderWrapper({ children, initialState = {} }: Props) {
    // Create the QueryClient on the client side.
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={initialState}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </HydrationBoundary>
        </QueryClientProvider>
    );
}
