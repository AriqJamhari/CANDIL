import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Tag, Eye, EyeOff, X, Upload } from 'lucide-react';

const DashboardFreelancer = () => {
  const { user } = useAuth();
  const [jasas, setJasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form modal/states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedJasaId, setSelectedJasaId] = useState(null);
  
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Desain Grafis');
  const [harga, setHarga] = useState('');
  const [status, setStatus] = useState('aktif');
  const [fotoFile, setFotoFile] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Desain Grafis',
    'Pemrograman & IT',
    'Penulisan & Penerjemahan',
    'Pemasaran Digital',
    'Video & Animasi',
    'Audio & Musik',
    'Lainnya'
  ];

  const fetchMyJasas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/jasa?freelancer_id=${user.id}`);
      setJasas(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar jasa Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyJasas();
    }
  }, [user]);

  const openCreateForm = () => {
    setEditMode(false);
    setSelectedJasaId(null);
    setJudul('');
    setDeskripsi('');
    setKategori('Desain Grafis');
    setHarga('');
    setStatus('aktif');
    setFotoFile(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (jasa) => {
    setEditMode(true);
    setSelectedJasaId(jasa.id);
    setJudul(jasa.judul);
    setDeskripsi(jasa.deskripsi);
    setKategori(jasa.kategori);
    setHarga(jasa.harga);
    setStatus(jasa.status);
    setFotoFile(null); // Keep old unless changed
    setFormError('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!judul || !deskripsi || !kategori || !harga) {
      setFormError('Semua kolom bertanda * wajib diisi.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    // Prepare Multipart Form Data for upload
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('kategori', kategori);
    formData.append('harga', harga);
    formData.append('status', status);
    if (fotoFile) {
      formData.append('foto', fotoFile);
    }

    try {
      if (editMode) {
        await axiosInstance.put(`/jasa/${selectedJasaId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosInstance.post('/jasa', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowForm(false);
      fetchMyJasas();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Gagal menyimpan data jasa.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteJasa = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jasa ini?')) return;

    try {
      await axiosInstance.delete(`/jasa/${id}`);
      fetchMyJasas();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menghapus jasa.');
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Etalase Jasa Anda</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Kelola, edit, dan pasarkan jasa Anda ke jutaan client
          </p>
        </div>
        <button onClick={openCreateForm} className="btn btn-primary">
          <Plus size={18} /> Buat Jasa Baru
        </button>
      </div>

      {/* Main Content List */}
      {error && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', textAlign: 'center', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border-glass)',
            borderTopColor: 'var(--accent-purple)',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>Memuat etalase Anda...</span>
        </div>
      ) : jasas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Tag size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3>Anda Belum Memiliki Jasa</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>Mulailah menawarkan keahlian Anda sekarang dengan membuat jasa pertama Anda!</p>
          <button onClick={openCreateForm} className="btn btn-primary">Buat Jasa Sekarang</button>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px' }}>Foto</th>
                <th style={{ padding: '12px 16px' }}>Judul Jasa</th>
                <th style={{ padding: '12px 16px' }}>Kategori</th>
                <th style={{ padding: '12px 16px' }}>Harga</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jasas.map((jasa) => (
                <tr key={jasa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', transition: 'var(--transition-smooth)' }} className="dashboard-row">
                  <td style={{ padding: '12px 16px' }}>
                    {jasa.foto ? (
                      <img 
                        src={`http://localhost:5000/uploads/${jasa.foto}`} 
                        alt={jasa.judul}
                        style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-glass)' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '35px', borderRadius: '4px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        <span style={{ margin: 'auto' }}>No Pic</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{jasa.judul}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{jasa.kategori}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{formatPrice(jasa.harga)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: jasa.status === 'aktif' ? 'var(--accent-teal)' : 'var(--text-muted)'
                    }}>
                      {jasa.status === 'aktif' ? <Eye size={14} /> : <EyeOff size={14} />}
                      {jasa.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditForm(jasa)}
                        style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#c084fc', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Edit Jasa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteJasa(jasa.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Hapus Jasa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Glass Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 7, 27, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '40px 20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '540px',
            padding: '24px',
            marginBottom: '40px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }} className="text-gradient">
                {editMode ? 'Edit Layanan Jasa' : 'Buat Jasa Baru'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Error */}
            {formError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Judul */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Judul Jasa *</label>
                <input 
                  type="text"
                  placeholder="Misal: Jasa Desain Logo Profesional Murah"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kategori *</label>
                <select 
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="form-control"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Harga */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga Layanan (Rp) *</label>
                <input 
                  type="number"
                  placeholder="Harga dalam Rupiah"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  className="form-control"
                  required
                  min="1"
                />
              </div>

              {/* Deskripsi */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deskripsi Layanan *</label>
                <textarea 
                  placeholder="Tulis detail layanan yang Anda berikan, revisi, file output, dsb..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="form-control"
                  rows="4"
                  required
                />
              </div>

              {/* Status (Edit mode only) */}
              {editMode && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status Tayang</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="aktif">Aktif (Tampil Publik)</option>
                    <option value="nonaktif">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              )}

              {/* Upload file */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Foto Layanan (JPEG/PNG/WEBP, Maks 5MB)</label>
                <div style={{
                  border: '1px dashed var(--border-glass)',
                  padding: '16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(10, 7, 27, 0.4)',
                  position: 'relative'
                }}>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoFile(e.target.files[0])}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <Upload size={24} style={{ color: 'var(--accent-purple)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {fotoFile ? `Foto terpilih: ${fotoFile.name}` : 'Klik untuk memilih foto produk/jasa'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Jasa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .dashboard-row:hover {
          background-color: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default DashboardFreelancer;
