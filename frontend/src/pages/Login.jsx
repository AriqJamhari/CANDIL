import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'freelancer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '75vh',
      padding: '20px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: 'var(--shadow-neon)',
            border: '2px solid var(--accent-purple)',
            overflow: 'hidden'
          }}>
            <img src="/candil_icon.png" alt="Candil Skill Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Masuk ke Candil Skill</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Hubungkan dengan layanan terbaik di Candil Skill Platform
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Kata Sandi</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Sedang Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'var(--accent-teal)', fontWeight: 600, textDecoration: 'none' }}>
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
