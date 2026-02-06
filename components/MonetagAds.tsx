"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useUser } from "@/context/UserContext";

export default function MonetagAds() {
    const { user } = useUser();
    const isPremium = user?.is_premium;

    // --- 1. Ad Injection Logic (Free Users Only) ---
    useEffect(() => {
        // If user is premium, we do NOT inject and we DO clean up
        if (isPremium) {
            console.log("[Monetag] Premium detected. Cleaning up...");
            const purge = () => {
                document.querySelectorAll('script[id^="monetag-"]').forEach(s => s.remove());
                const selectors = [
                    'iframe[src*="alwingulla"]', 'iframe[src*="nap5k"]',
                    'iframe[src*="3nbf4"]', 'iframe[src*="quge5"]',
                    'div[id^="pro-"]', '.monetag-ad', 'ins.adsbygoogle'
                ];
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
            };
            purge();
            const interval = setInterval(purge, 3000);
            return () => clearInterval(interval);
        }

        // --- FREE USER: Inject Tags ---
        const inject = () => {
            console.log("[Monetag] Initializing all tags...");

            // Tag 1 (3nbf4.com)
            if (!document.getElementById('monetag-tag-1')) {
                const s1 = document.createElement('script');
                s1.id = 'monetag-tag-1';
                s1.src = "https://3nbf4.com/act/files/tag.min.js?z=10578371";
                s1.setAttribute('data-cfasync', 'false');
                s1.async = true;
                document.head.appendChild(s1);
            }

            // Tag 2 (quge5.com)
            if (!document.getElementById('monetag-tag-2')) {
                const s2 = document.createElement('script');
                s2.id = 'monetag-tag-2';
                s2.src = "https://quge5.com/88/tag.min.js";
                s2.setAttribute('data-zone', '206466');
                s2.setAttribute('data-cfasync', 'false');
                s2.async = true;
                document.head.appendChild(s2);
            }

            // Tag 3 (nap5k.com wrapper)
            if (!document.getElementById('monetag-tag-3')) {
                const s3 = document.createElement('script');
                s3.id = 'monetag-tag-3';
                s3.innerHTML = `
                    (function(s){
                        if(window.monetag_final_initialized) return;
                        window.monetag_final_initialized = true;
                        s.dataset.zone='10533944';
                        s.src='https://nap5k.com/tag.min.js';
                        ([document.documentElement, document.body].filter(Boolean).pop().appendChild(s));
                    })(document.createElement('script'));
                `;
                document.head.appendChild(s3);
            }
        };

        // Use a single small delay to ensure DOM is ready
        const timer = setTimeout(inject, 1000);
        return () => clearTimeout(timer);
    }, [isPremium]);

    if (isPremium) return null;

    return (
        <Script id="monetag-performance-patch" strategy="afterInteractive">
            {`
                (function() {
                    if (typeof performance === 'undefined' || !performance.measure) return;
                    const originalMeasure = performance.measure;
                    performance.measure = function(name, startMark, endMark) {
                        try {
                            return originalMeasure.apply(this, arguments);
                        } catch (e) {
                            if (startMark === 'hidden_iframe:start' || (name && name.includes('monetag'))) return;
                            try { return originalMeasure.apply(this, arguments); } catch(err) { return; }
                        }
                    };
                })();
            `}
        </Script>
    );
}
