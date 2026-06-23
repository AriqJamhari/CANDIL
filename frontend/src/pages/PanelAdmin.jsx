import React, { useState, useEffect } from 'react';
import axiosInstance, { getUploadUrl } from '../api/axiosInstance';
import { Users, Tag, ShoppingBag, Send, ShieldAlert, FileText, Award, X, Eye } from 'lucide-react';

const PanelAdmin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [jasasList, setJasasList] = useState([]);
  const [pesanansList, setPesanansList] = useState([]);
  const [premiumRequestsList, setPremiumRequestsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Broadcast Notification state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [bcLoading, setBcLoading] = useState(false);
  const [bcSuccess, setBcSuccess] = useState('');
  const [bcError, setBcError] = useState('');

  // Premium actions state
  const [selectedRequest, setSelectedRequest] = useState(null); // Proof detail modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

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
      } else if (tab === 'premium') {
        const res = await axiosInstance.get('/premium/requests');
        setPremiumRequestsList(res.data.requests || []);
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

  const handleApprovePremium = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui pengajuan premium ini?')) return;
    setVerifyLoading(true);
    try {
      await axiosInstance.patch(`/premium/requests/${id}/verify`, { action: 'approve' });
      alert('Pengajuan premium disetujui!');
      fetchTabData('premium');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal memverifikasi pengajuan premium.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRejectClick = (id) => {
    setRejectingRequestId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Harap masukkan alasan penolakan.');
      return;
    }
    setVerifyLoading(true);
    try {
      await axiosInstance.patch(`/premium/requests/${rejectingRequestId}/verify`, {
        action: 'reject',
        catatan_admin: rejectReason
      });
      alert('Pengajuan premium ditolak.');
      setShowRejectModal(false);
      fetchTabData('premium');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal memproses penolakan.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleToggleJasaStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    const confirmMsg = nextStatus === 'nonaktif' 
      ? 'Apakah Anda yakin ingin menonaktifkan/menyembunyikan jasa ini?' 
      : 'Apakah Anda yakin ingin mengaktifkan kembali jasa ini?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await axiosInstance.patch(`/admin/jasa/${id}/status`, { status: nextStatus });
      alert(`Status jasa berhasil diubah menjadi ${nextStatus}!`);
      fetchTabData('jasa');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengubah status jasa.');
    }
  };

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

            <button 
              onClick={() => setActiveTab('premium')}
              className={`btn ${activeTab === 'premium' ? 'btn-teal' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 16px' }}
            >
              <Award size={16} /> Verifikasi Premium ({activeTab === 'premium' ? premiumRequestsList.length : '...'})
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
                      <th style={{ padding: '10px', textAlign: 'right' }}>Aksi</th>
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
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleToggleJasaStatus(j.id, j.status)}
                            className="btn btn-outline"
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '0.75rem', 
                              borderColor: j.status === 'aktif' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(20, 184, 166, 0.4)', 
                              color: j.status === 'aktif' ? '#fca5a5' : '#5eead4' 
                            }}
                          >
                            {j.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
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

              {/* 4. Premium Requests Table */}
              {activeTab === 'premium' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Freelancer</th>
                      <th style={{ padding: '10px' }}>Paket</th>
                      <th style={{ padding: '10px' }}>Harga</th>
                      <th style={{ padding: '10px' }}>Bukti Bayar</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiumRequestsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Tidak ada pengajuan premium.
                        </td>
                      </tr>
                    ) : (
                      premiumRequestsList.map(pr => (
                        <tr key={pr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }} className="admin-row">
                          <td style={{ padding: '10px', color: 'var(--text-muted)' }}>#{pr.id}</td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>
                            <div>{pr.freelancer_nama}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pr.freelancer_email}</div>
                          </td>
                          <td style={{ padding: '10px', textTransform: 'capitalize' }}>
                            {pr.paket === 'monthly' ? 'Bulanan' : 'Tahunan'}
                          </td>
                          <td style={{ padding: '10px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{formatPrice(pr.harga)}</td>
                          <td style={{ padding: '10px' }}>
                            {pr.bukti_bayar ? (
                              <button 
                                onClick={() => setSelectedRequest(pr)}
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} /> Lihat Bukti
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Tidak ada</span>
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                              background: pr.status === 'approved' ? 'rgba(20, 184, 166, 0.15)' : pr.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: pr.status === 'approved' ? '#5eead4' : pr.status === 'rejected' ? '#fca5a5' : '#fcd34d'
                            }}>
                              {pr.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            {pr.status === 'pending' ? (
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleApprovePremium(pr.id)}
                                  className="btn btn-teal"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  disabled={verifyLoading}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectClick(pr.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                                  disabled={verifyLoading}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {pr.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Detail Bukti Pembayaran */}
      {selectedRequest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 7, 27, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedRequest(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Bukti Pembayaran</h3>
            <div style={{ width: '100%', maxHeight: '400px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-glass)', background: '#000', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={getUploadUrl(selectedRequest.bukti_bayar)} 
                alt="Bukti Bayar" 
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
              <div><strong>Freelancer:</strong> {selectedRequest.freelancer_nama}</div>
              <div><strong>Paket:</strong> {selectedRequest.paket === 'monthly' ? 'Bulanan' : 'Tahunan'}</div>
              <div><strong>Harga:</strong> {formatPrice(selectedRequest.harga)}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Alasan Penolakan (Reject) */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 7, 27, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setShowRejectModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Tolak Pengajuan Premium</h3>
            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Alasan Penolakan *</label>
                <textarea 
                  className="form-control"
                  placeholder="Tulis alasan penolakan agar freelancer mengetahuinya..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="4"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)} 
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgb(239, 68, 68)' }}
                  disabled={verifyLoading}
                >
                  Tolak Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
