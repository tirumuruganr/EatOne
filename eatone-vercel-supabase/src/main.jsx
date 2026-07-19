import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminInvoice from "./AdminInvoice.jsx";
import "./index.css";

const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <AdminInvoice /> : <App />}
  </React.StrictMode>
);
