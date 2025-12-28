import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

function Router() {
  return (
    <Routes>
      {/* Pagina inicial */}
      <Route path="/" element={<Home />} />

      {/* Pagina de login */}
      <Route path="/login" element={<Login />} />

      {/* Pagina de cadastro */}
      <Route path="/register" element={<Register />} />

      {/* Pagina de redefinicao de senha */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Pagina do dashboard - PROTEGIDA */}
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
