import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Insumos from './pages/Insumos.jsx';
import Productos from './pages/Productos.jsx';
import CostosFijos from './pages/CostosFijos.jsx';
import CategoriasGasto from './pages/CategoriasGasto.jsx';
import Disenos from './pages/Disenos.jsx';
import Gastos from './pages/Gastos.jsx';
import ComprasInsumo from './pages/ComprasInsumo.jsx';
import MovimientosInventario from './pages/MovimientosInventario.jsx';
import Ventas from './pages/Ventas.jsx';
import Reportes from './pages/Reportes.jsx';
import PuntoEquilibrio from './pages/PuntoEquilibrio.jsx';
import Proyecciones from './pages/Proyecciones.jsx';
import EventosEstacionales from './pages/EventosEstacionales.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="productos" element={<Productos />} />
        <Route path="disenos" element={<Disenos />} />
        <Route path="insumos" element={<Insumos />} />
        <Route path="compras-insumo" element={<ComprasInsumo />} />
        <Route path="movimientos-inventario" element={<MovimientosInventario />} />
        <Route path="costos-fijos" element={<CostosFijos />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="categorias-gasto" element={<CategoriasGasto />} />
        <Route path="punto-equilibrio" element={<PuntoEquilibrio />} />
        <Route path="proyecciones" element={<Proyecciones />} />
        <Route path="eventos-estacionales" element={<EventosEstacionales />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
