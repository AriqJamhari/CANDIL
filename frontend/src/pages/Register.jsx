import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !email || !password || !role) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(nama, email, password, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registrasi gagal. Periksa kembali input Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '20px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Buat Akun Baru</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Bergabunglah dengan ekosistem digital Candil Skill Platform
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(20, 184, 166, 0.15)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            borderRadius: '10px',
            color: '#5eead4',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Registrasi berhasil! Mengarahkan Anda ke halaman masuk...
          </div>
        )}

        {/* Error Alert */}
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

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Nama */}
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Nama Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="form-control"
                required
              />
            </div>

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
            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                required
                minLength={6}
              />
            </div>

            {/* Role selection */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Daftar Sebagai</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: role === 'client' ? 'var(--accent-teal)' : 'var(--border-glass)',
                  background: role === 'client' ? 'rgba(20, 184, 166, 0.08)' : 'rgba(10, 7, 27, 0.5)',
                  cursor: 'pointer',
                  color: role === 'client' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={role === 'client'}
                    onChange={() => setRole('client')}
                    style={{ display: 'none' }}
                  />
                  Client (Pembeli)
                </label>

                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: role === 'freelancer' ? 'var(--accent-purple)' : 'var(--border-glass)',
                  background: role === 'freelancer' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(10, 7, 27, 0.5)',
                  cursor: 'pointer',
                  color: role === 'freelancer' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    checked={role === 'freelancer'}
                    onChange={() => setRole('freelancer')}
                    style={{ display: 'none' }}
                  />
                  Freelancer (Penjual)
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
        )}

        {/* Login redirect */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 600, textDecoration: 'none' }}>
            Masuk Di Sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
