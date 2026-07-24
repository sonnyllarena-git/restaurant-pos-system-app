import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import PriceCheckModal from './PriceCheckModal';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../services/validationService';

// Only admin/cashier can act on this (Inventory pricing is admin/cashier-only), so
// kitchen/viewer logins skip the nag entirely rather than showing a checklist they
// have no route to follow through on.
const PRICE_CHECK_ROLES = ['admin', 'cashier'];

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPriceCheck, setShowPriceCheck] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateLoginForm({ username, password });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const loggedInUser = await login(username, password);
      if (PRICE_CHECK_ROLES.includes(loggedInUser?.role)) {
        setShowPriceCheck(true);
      } else {
        navigate('/home');
      }
    } catch (err) {
      setErrors({ form: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceCheckDone = () => {
    setShowPriceCheck(false);
    navigate('/home');
  };

  const handleGoToInventory = () => {
    setShowPriceCheck(false);
    navigate('/inventory');
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          disabled={loading}
          error={errors.username}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          error={errors.password}
        />
      </div>
      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 border-slate-300 rounded"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
          Remember me
        </label>
      </div>
      {errors.form && (
        <div className="rounded bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{errors.form}</p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading} loading={loading}>
        LOGIN
      </Button>
    </form>
    {showPriceCheck && (
      <PriceCheckModal onDone={handlePriceCheckDone} onGoToInventory={handleGoToInventory} />
    )}
    </>
  );
}
