import { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={setPage} />

      <main className="app-main">
        {page === "dashboard" && <Dashboard />}
        {page === "history" && <History />}
      </main>
    </div>
  );
}
