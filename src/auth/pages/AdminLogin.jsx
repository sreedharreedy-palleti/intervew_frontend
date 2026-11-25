import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await loginAdmin(formData);
      if (res?.user?.role === 'admin') {
        toast.success('Admin authentication verified. Welcome to Executive Panel.');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success(`Welcome back, ${res?.user?.name || 'Candidate'}! Opening courses catalog...`);
        navigate('/courses', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check email and password.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Administrator Portal"
      subtitle="Restricted access for system management & course administration"
      footerText="Looking for Candidate sign in?"
      footerLinkText="Go to Candidate Portal"
      footerLinkTo="/login"
      isAdminFlow={true}
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Input
          id="email"
          label="Admin Email"
          type="email"
          placeholder="admin@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          icon={<Mail size={16} />}
        />

        <Input
          id="password"
          label="Admin Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          icon={<Lock size={16} />}
        />

        <Button
          type="submit"
          variant="primary"
          block
          size="lg"
          isLoading={isLoading}
          icon={<ShieldCheck size={18} />}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          }}
        >
          Sign In as Administrator
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
