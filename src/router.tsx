import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

function Router() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Home />} />

      {/* Página de login */}
      <Route path="/login" element={<Login />} />

      {/* Página de cadastro */}
      <Route path="/register" element={<Register />} />

      {/* Página do dashboard - PROTEGIDA */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default Router;
