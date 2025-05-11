import { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "132315875574-t1suu2183q7vo2imc8qlfuqa0kenrpq3.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export function useGoogleCalendar() {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.load("client:auth2", async () => {
        try {
          await gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          });
          await gapi.client.load("calendar", "v3");

          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          setIsReady(true);
        } catch (error) {
          console.error("Failed to initialize Google API:", error);
        }
      });
    };

    initClient();
  }, []);

  const signInWithGoogle = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    setIsSignedIn(true);
  };
  const logOutOfGoogle = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    setIsSignedIn(false);
  };

  return { isReady, isSignedIn, signInWithGoogle, logOutOfGoogle };
}
