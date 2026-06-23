import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { getUploadUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Tag, Eye, EyeOff, X, Upload, Briefcase, ExternalLink, Award } from 'lucide-react';

const DashboardFreelancer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jasa');
  
  // Jasas States
  const [jasas, setJasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Jasa Form Modal States
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

  // Portfolios States
  const [portofolios, setPortofolios] = useState([]);
  const [portoLoading, setPortoLoading] = useState(false);
  const [portoError, setPortoError] = useState('');

  // Portfolio Form Modal States
  const [showPortoForm, setShowPortoForm] = useState(false);
  const [portoEditMode, setPortoEditMode] = useState(false);
  const [selectedPortoId, setSelectedPortoId] = useState(null);
  const [portoJudul, setPortoJudul] = useState('');
  const [portoDeskripsi, setPortoDeskripsi] = useState('');
  const [portoLinkUrl, setPortoLinkUrl] = useState('');
  const [portoGambarFile, setPortoGambarFile] = useState(null);
  
  const [portoFormLoading, setPortoFormLoading] = useState(false);
  const [portoFormError, setPortoFormError] = useState('');

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

  const fetchMyPortfolios = async () => {
    setPortoLoading(true);
    setPortoError('');
    try {
      const res = await axiosInstance.get('/portofolio/milik/saya');
      setPortofolios(res.data.portofolio || []);
    } catch (err) {
      console.error(err);
      setPortoError('Gagal memuat daftar portofolio Anda.');
    } finally {
      setPortoLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyJasas();
      fetchMyPortfolios();
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

  const openCreatePortoForm = () => {
    setPortoEditMode(false);
    setSelectedPortoId(null);
    setPortoJudul('');
    setPortoDeskripsi('');
    setPortoLinkUrl('');
    setPortoGambarFile(null);
    setPortoFormError('');
    setShowPortoForm(true);
  };

  const openEditPortoForm = (porto) => {
    setPortoEditMode(true);
    setSelectedPortoId(porto.id);
    setPortoJudul(porto.judul);
    setPortoDeskripsi(porto.deskripsi || '');
    setPortoLinkUrl(porto.link_url || '');
    setPortoGambarFile(null);
    setPortoFormError('');
    setShowPortoForm(true);
  };

  const handlePortoFormSubmit = async (e) => {
    e.preventDefault();
    if (!portoJudul) {
      setPortoFormError('Judul portofolio wajib diisi.');
      return;
    }

    setPortoFormLoading(true);
    setPortoFormError('');

    const formData = new FormData();
    formData.append('judul', portoJudul);
    formData.append('deskripsi', portoDeskripsi);
    formData.append('link_url', portoLinkUrl);
    if (portoGambarFile) {
      formData.append('gambar', portoGambarFile);
    }

    try {
      if (portoEditMode) {
        await axiosInstance.put(`/portofolio/${selectedPortoId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosInstance.post('/portofolio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowPortoForm(false);
      fetchMyPortfolios();
    } catch (err) {
      console.error(err);
      setPortoFormError(err.response?.data?.message || 'Gagal menyimpan data portofolio.');
    } finally {
      setPortoFormLoading(false);
    }
  };

  const handleDeletePorto = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus portofolio ini?')) return;

    try {
      await axiosInstance.delete(`/portofolio/${id}`);
      fetchMyPortfolios();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menghapus portofolio.');
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
      {/* Dashboard Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard Freelancer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Kelola etalase jasa, portofolio karya, dan keanggotaan premium Anda.
          </p>
        </div>
        
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('jasa')}
            className={`btn ${activeTab === 'jasa' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Tag size={16} /> Jasa Saya
          </button>
          <button 
            onClick={() => setActiveTab('porto')}
            className={`btn ${activeTab === 'porto' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Briefcase size={16} /> Portofolio
          </button>
          <button 
            onClick={() => navigate('/premium')}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#ffd700', color: '#ffd700' }}
          >
            <Award size={16} /> Premium
          </button>
        </div>
      </div>

      {/* Tab: Jasa Saya */}
      {activeTab === 'jasa' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daftar Layanan Jasa Anda</h3>
            <button onClick={openCreateForm} className="btn btn-primary">
              <Plus size={18} /> Buat Jasa Baru
            </button>
          </div>

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
                            src={getUploadUrl(jasa.foto)} 
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
        </>
      )}

      {/* Tab: Portofolio */}
      {activeTab === 'porto' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Karya Portofolio Anda</h3>
            <button onClick={openCreatePortoForm} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Tambah Portofolio
            </button>
          </div>

          {portoError && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', textAlign: 'center', marginBottom: '24px' }}>
              {portoError}
            </div>
          )}

          {portoLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid var(--border-glass)',
                borderTopColor: 'var(--accent-purple)',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ color: 'var(--text-secondary)' }}>Memuat portofolio...</span>
            </div>
          ) : portofolios.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Briefcase size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
              <h3>Belum Ada Portofolio</h3>
              <p style={{ marginTop: '8px', marginBottom: '20px' }}>Unggah hasil karya terbaik Anda untuk menarik perhatian klien potensial!</p>
              <button onClick={openCreatePortoForm} className="btn btn-primary">Tambah Portofolio Pertama</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {portofolios.map(porto => (
                <div key={porto.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                  {porto.gambar ? (
                    <div style={{ height: '160px', width: '100%', overflow: 'hidden', borderBottom: '1px solid var(--border-glass)' }}>
                      <img 
                        src={getUploadUrl(porto.gambar)} 
                        alt={porto.judul} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: '160px', width: '100%', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Briefcase size={32} />
                    </div>
                  )}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{porto.judul}</h4>
                    {porto.deskripsi && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                        {porto.deskripsi}
                      </p>
                    )}
                    {porto.link_url && (
                      <a href={porto.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500, marginTop: 'auto' }}>
                        Link Project <ExternalLink size={12} />
                      </a>
                    )}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: porto.link_url ? '8px' : 'auto' }}>
                      <button 
                        onClick={() => openEditPortoForm(porto)}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePorto(porto.id)}
                        className="btn btn-outline"
                        style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Glass Form Modal (Jasa) */}
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

      {/* Portfolio Glass Form Modal */}
      {showPortoForm && (
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
            maxWidth: '500px',
            padding: '24px',
            marginBottom: '40px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }} className="text-gradient">
                {portoEditMode ? 'Edit Portofolio Kerja' : 'Tambah Portofolio Baru'}
              </h2>
              <button 
                onClick={() => setShowPortoForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Error */}
            {portoFormError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>
                {portoFormError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handlePortoFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Judul */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Judul Portofolio *</label>
                <input 
                  type="text"
                  placeholder="Misal: Redesign Aplikasi E-Commerce"
                  value={portoJudul}
                  onChange={(e) => setPortoJudul(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              {/* Deskripsi */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deskripsi Karya</label>
                <textarea 
                  placeholder="Ceritakan tantangan, teknologi, dan hasil dari karya ini..."
                  value={portoDeskripsi}
                  onChange={(e) => setPortoDeskripsi(e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>

              {/* Link URL */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Link Project (Opsional)</label>
                <input 
                  type="url"
                  placeholder="Misal: https://github.com/username/project"
                  value={portoLinkUrl}
                  onChange={(e) => setPortoLinkUrl(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Upload file */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gambar Portofolio (JPEG/PNG/WEBP, Maks 5MB)</label>
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
                    onChange={(e) => setPortoGambarFile(e.target.files[0])}
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
                    {portoGambarFile ? `Foto terpilih: ${portoGambarFile.name}` : 'Klik untuk memilih foto hasil karya/portofolio'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPortoForm(false)} 
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={portoFormLoading}
                >
                  {portoFormLoading ? 'Menyimpan...' : 'Simpan Portofolio'}
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
