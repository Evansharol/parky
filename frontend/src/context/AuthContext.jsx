/**
 * context/AuthContext.jsx – Global auth state (login, logout, user profile)
 */
import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('parky_token') || null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'LOGIN':
      localStorage.setItem('parky_token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('parky_token');
      return { ...state, user: null, token: null, loading: false };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('parky_token');
    if (!token) {
      dispatch({ type: 'STOP_LOADING' });
      return;
    }
    api.get('/auth/me')
      .then(res => dispatch({ type: 'SET_USER', payload: res.data.user }))
      .catch(() => {
        localStorage.removeItem('parky_token');
        dispatch({ type: 'STOP_LOADING' });
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    dispatch({ type: 'LOGIN', payload: res.data });
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    dispatch({ type: 'LOGIN', payload: res.data });
    return res.data.user;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateUser = (user) => dispatch({ type: 'SET_USER', payload: user });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
