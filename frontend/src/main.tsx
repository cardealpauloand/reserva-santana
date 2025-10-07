import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import logoUrl from "./assets/logo.png";

const ensureFavicon = (iconUrl: string) => {
  const head = document.head;
  const link =
    head.querySelector<HTMLLinkElement>("link[rel~='icon']") ??
    (() => {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      head.appendChild(newLink);
      return newLink;
    })();

  link.type = "image/png";
  link.href = iconUrl;
};

ensureFavicon(logoUrl);

createRoot(document.getElementById("root")!).render(<App />);
