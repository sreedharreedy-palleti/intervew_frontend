import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginUser, loginAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/courses';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let res;
      try {
        res = await loginUser(formData);
      } catch (userErr) {
        // If candidate login endpoint failed, fallback to admin login
        try {
          res = await loginAdmin(formData);
        } catch {
          throw userErr;
        }
      }

      // Check role returned from authentication
      const userRole = res?.user?.role;
      if (userRole === 'admin') {
        toast.success(`Welcome Administrator (${res.user?.name || res.user?.email})! Opening Admin Panel...`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success(`Welcome back, ${res?.user?.name || 'Candidate'}!`);
        navigate(from === '/login' || from === '/admin/login' ? '/courses' : from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your email & password to access your portal"
      footerText="Don't have an account?"
      footerLinkText="Register here"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          icon={<Mail size={16} />}
        />

        <div style={{ position: 'relative' }}>
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            icon={<Lock size={16} />}
          />
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          block
          size="lg"
          isLoading={isLoading}
          icon={<LogIn size={18} />}
        >
          Sign In
        </Button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.25rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <Button
          type="button"
          variant="secondary"
          block
          size="lg"
          onClick={() => navigate('/register')}
          icon={<UserPlus size={18} />}
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
          }}
        >
          Register New Account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;
