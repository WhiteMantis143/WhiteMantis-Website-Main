"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ErrorHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get("error");

        if (error === "invalid-product") {
            toast.error("Invalid product. This product type is not supported.");

            // Clean up URL by removing error parameter
            if (window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.delete("error");
                window.history.replaceState({}, "", url.toString());
            }
        }
    }, [searchParams]);

    return null;
}
