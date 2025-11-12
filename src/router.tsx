import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login"; // ⬅️ importe o novo componente

function Router() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Home />} />

      {/* Página de login */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default Router;
