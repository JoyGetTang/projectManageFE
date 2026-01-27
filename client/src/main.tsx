import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Redux提供者
import { PersistGate } from "redux-persist/integration/react"; // 持久化网关
import { persistor, store } from "./store/"; // 导入配置好的store和persistor
import App from "./App";
import "./index.css";
import React from "react";

createRoot(document.getElementById("root")!).render(
  //   <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>

  //   </React.StrictMode>
);
