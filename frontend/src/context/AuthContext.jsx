import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('placement_user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('placement_token'));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('placement_token')));

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem('placement_token', nextToken);
    else localStorage.removeItem('placement_token');

    if (nextUser) localStorage.setItem('placement_user', JSON.stringify(nextUser));
    else localStorage.removeItem('placement_user');

    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('placement:logout', onLogout);
    return () => window.removeEventListener('placement:logout', onLogout);
  }, [logout]);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    api
      .get('/auth/me')
      .then((data) => {
        if (mounted) persist(token, data.user);
      })
      .catch(() => {
        if (mounted) persist(null, null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // Only revalidate when the token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(
    async (email, password) => {
      const data = await api.post('/auth/login', { email, password });
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await api.post('/auth/register', payload);
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const refreshUser = useCallback(async () => {
    const data = await api.get('/auth/me');
    persist(localStorage.getItem('placement_token'), data.user);
    return data.user;
  }, [persist]);

  const updateUser = useCallback(
    (patch) => {
      setUser((current) => {
        const next = { ...current, ...patch };
        localStorage.setItem('placement_user', JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student',
      login,
      register,
      logout,
      refreshUser,
      updateUser
    }),
    [token, user, loading, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
