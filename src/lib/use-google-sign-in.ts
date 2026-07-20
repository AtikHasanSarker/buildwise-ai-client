"use client";

import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: { isDisplayed: () => boolean }) => void) => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const GIS_SCRIPT_ID = "google-identity-services";

export function useGoogleSignIn(onCredential: (idToken: string) => void) {
  const [loaded, setLoaded] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  // Load Google Identity Services script
  useEffect(() => {
    // Already loaded
    if (window.google?.accounts?.id) {
      setLoaded(true);
      return;
    }

    // Already inserted
    if (document.getElementById(GIS_SCRIPT_ID)) {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          setLoaded(true);
        }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement("script");
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          setLoaded(true);
        }
      }, 100);
    };
    script.onerror = () => {
      console.error("Failed to load Google Identity Services");
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Google when loaded
  useEffect(() => {
    if (!loaded || initializing) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        callbackRef.current(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    setInitializing(true);
  }, [loaded, initializing]);

  const signIn = useCallback(() => {
    if (!loaded || !window.google?.accounts?.id) {
      console.warn("Google Identity Services not loaded");
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (!notification.isDisplayed()) {
        console.warn("Google prompt not displayed — popup may be blocked");
      }
    });
  }, [loaded]);

  return { signIn, loaded };
}
