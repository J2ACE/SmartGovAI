import React from "react";
import { createRoot } from "react-dom/client";
import { APIProvider } from "@vis.gl/react-google-maps";
import App from "./App.tsx";
import "./index.css";

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {apiKey ? (
      <APIProvider apiKey={apiKey} libraries={['visualization']}>
        <App />
      </APIProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
