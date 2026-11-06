import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ServerWakingBanner from './ServerWakingBanner.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const primaryLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/productos', label: 'Productos' },
];

const secondaryLinks = [
  { to: '/disenos', label: 'Disenos' },
  { to: '/insumos', label: 'Insumos' },
  { to: '/compras-insumo', label: 'Compras de Insumo' },
  { to: '/movimientos-inventario', label: 'Movimientos de Inventario' },
  { to: '/costos-fijos', label: 'Costos Fijos' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/categorias-gasto', label: 'Categorias de Gasto' },
  { to: '/punto-equilibrio', label: 'Punto de Equilibrio' },
  { to: '/proyecciones', label: 'Proyecciones' },
  { to: '/eventos-estacionales', label: 'Eventos Estacionales' },
  { to: '/reportes', label: 'Reportes' },
];

function linkClass({ isActive }) {
  return `block whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium ${
    isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const enSeccionAvanzada = secondaryLinks.some((link) => location.pathname.startsWith(link.to));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream dark:bg-night">
      <ServerWakingBanner />
      <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 flex md:flex-col gap-2 overflow-x-auto">
        <div className="hidden md:flex items-center gap-2 mb-4">
          <img src="/logo.png" alt="mayo treinta" className="w-9 h-9 rounded-full object-cover" />
          <div>
            <h1 className="text-lg font-serif font-semibold text-gray-800 leading-tight">
              mayo treinta
            </h1>
            <p className="text-xs text-gray-500">{user?.nombre}</p>
          </div>
        </div>

        {primaryLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            {link.label}
          </NavLink>
        ))}

        <details className="md:mt-1" open={enSeccionAvanzada}>
          <summary className="cursor-pointer whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 list-none">
            Mas (inventario, costos, proyecciones...)
          </summary>
          <div className="flex md:flex-col gap-1 mt-1 pl-2">
            {secondaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </details>

        <div className="md:mt-auto flex md:flex-col gap-1">
          <ThemeToggle />
          <button
            onClick={logout}
            className="whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
