import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { checkHealth } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [serverWaking, setServerWaking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const wakingTimer = setTimeout(() => {
      if (!cancelled) setServerWaking(true);
    }, 3000);

    async function init() {
      try {
        await checkHealth();
      } catch {
        // el servidor puede estar despertando (Render en frio); seguimos con el flujo normal
      } finally {
        clearTimeout(wakingTimer);
        if (!cancelled) setServerWaking(false);
      }

      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const { data } = await api.get('/auth/me');
          if (!cancelled) setUser(data);
        } catch {
          localStorage.removeItem('token');
          if (!cancelled) setToken(null);
        }
      }
      if (!cancelled) setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
      clearTimeout(wakingTimer);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, serverWaking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
