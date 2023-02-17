import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./app/store";
import App from "./App";
import { startupNostr } from "./nostr-redux/startup";
import { addRelay } from "./nostr-redux/relays";
import { NOSTR_RELAY_URLS } from "./app/constants";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

store.dispatch(addRelay(NOSTR_RELAY_URLS[0]));
store.dispatch(startupNostr);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
