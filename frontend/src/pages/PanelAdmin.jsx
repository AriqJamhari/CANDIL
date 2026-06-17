import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users, Tag, ShoppingBag, Send, ShieldAlert, FileText } from 'lucide-react';

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [jasasList, setJasasList] = useState([]);
  const [pesanansList, setPesanansList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Broadcast Notification state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [bcLoading, setBcLoading] = useState(false);
  const [bcSuccess, setBcSuccess] = useState('');
  const [bcError, setBcError] = useState('');

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'users') {
        const res = await axiosInstance.get('/admin/users');
        setUsersList(res.data);
      } else if (tab === 'jasa') {
        const res = await axiosInstance.get('/admin/jasa');
        setJasasList(res.data);
      } else if (tab === 'pesanan') {
        const res = await axiosInstance.get('/admin/pesanan');
        setPesanansList(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data administrasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setBcLoading(true);
    setBcSuccess('');
    setBcError('');

    try {
      await axiosInstance.post('/admin/notifikasi', { pesan: broadcastMsg });
      setBcSuccess('Notifikasi berhasil dibroadcast ke seluruh user!');
      setBroadcastMsg('');
    } catch (err) {
      console.error(err);
      setBcError(err.response?.data?.message || 'Gagal mengirim broadcast.');
    } finally {
      setBcLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={32} style={{ color: 'var(--accent-purple)' }} /> Panel Administrasi
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Pantau seluruh aktivitas pengguna, iklan jasa, pesanan, dan kirim pengumuman global.
        </p>
      </div>

      {/* Grid: Broadcast panel & Tabular data */}
      <div className="admin-panel-layout">
        
        {/* Broadcast Form Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }} className="text-gradient">
            <Send size={16} /> Broadcast Global
          </h3>

          {bcSuccess && (
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', color: '#5eead4', fontSize: '0.8rem', marginBottom: '12px' }}>
              {bcSuccess}
            </div>
          )}

          {bcError && (
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '12px' }}>
              {bcError}
            </div>
          )}

          <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Isi Pengumuman</label>
              <textarea 
                className="form-control"
                placeholder="Tulis pengumuman penting untuk semua pengguna..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                rows="5"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={bcLoading}
              style={{ padding: '10px' }}
            >
              {bcLoading ? 'Mengirim...' : 'Kirim Broadcast'}
            </button>
          </form>
        </div>

        {/* Tabular Lists */}
        <div>
          {/* Tabs header */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button 
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? 'btn-teal' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <Users size={16} /> Users ({activeTab === 'users' ? usersList.length : '...'})
            </button>
            
            <button 
              onClick={() => setActiveTab('jasa')}
              className={`btn ${activeTab === 'jasa' ? 'btn-teal' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <Tag size={16} /> Jasa ({activeTab === 'jasa' ? jasasList.length : '...'})
            </button>

            <button 
              onClick={() => setActiveTab('pesanan')}
              className={`btn ${activeTab === 'pesanan' ? 'btn-teal' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <ShoppingBag size={16} /> Pesanan ({activeTab === 'pesanan' ? pesanansList.length : '...'})
            </button>
          </div>

          {/* Data area */}
          {error && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--border-glass)',
                borderTopColor: 'var(--accent-teal)',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mengambil data...</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '12px' }}>
              {/* 1. Users Table */}
              {activeTab === 'users' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Nama</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Role</th>
                      <th style={{ padding: '10px' }}>Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }} className="admin-row">
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>#{u.id}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{u.nama}</td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : u.role === 'freelancer' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                            color: u.role === 'admin' ? '#fca5a5' : u.role === 'freelancer' ? '#c084fc' : '#5eead4'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 2. Jasa Table */}
              {activeTab === 'jasa' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Freelancer</th>
                      <th style={{ padding: '10px' }}>Judul</th>
                      <th style={{ padding: '10px' }}>Kategori</th>
                      <th style={{ padding: '10px' }}>Harga</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jasasList.map(j => (
                      <tr key={j.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }} className="admin-row">
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>#{j.id}</td>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{j.freelancer_nama}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{j.judul}</td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{j.kategori}</td>
                        <td style={{ padding: '10px', color: 'var(--accent-teal)' }}>{formatPrice(j.harga)}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                            backgroundColor: j.status === 'aktif' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: j.status === 'aktif' ? '#5eead4' : 'var(--text-muted)'
                          }}>
                            {j.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. Orders Table */}
              {activeTab === 'pesanan' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Client</th>
                      <th style={{ padding: '10px' }}>Freelancer</th>
                      <th style={{ padding: '10px' }}>Jasa</th>
                      <th style={{ padding: '10px' }}>Harga</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesanansList.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }} className="admin-row">
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>#{p.id}</td>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{p.client_nama}</td>
                        <td style={{ padding: '10px', fontWeight: 500 }}>{p.freelancer_nama}</td>
                        <td style={{ padding: '10px' }}>{p.jasa_judul}</td>
                        <td style={{ padding: '10px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{formatPrice(p.jasa_harga)}</td>
                        <td style={{ padding: '10px' }}>
                          <span className={`badge badge-${p.status}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>
      
      <style>{`
        .admin-row:hover {
          background-color: rgba(255,255,255,0.015);
        }
        @media (max-width: 768px) {
          .admin-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PanelAdmin;
