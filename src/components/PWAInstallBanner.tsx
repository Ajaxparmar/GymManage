"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setTimeout(() => setIsInstalled(true), 0);
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
    if (ios) {
      setTimeout(() => {
        setIsIos(true);
        setShow(true);
      }, 0); // Batch state updates to avoid cascading renders
      return;
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!show || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className="mx-auto max-w-lg rounded-2xl border bg-card shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install Gym Manager</p>
            {isIos ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Install the app for faster access and offline support
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isIos && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall} className="flex-1 gap-2 h-9">
              <Download className="h-4 w-4" />
              Install App
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss} className="h-9">
              Not now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}