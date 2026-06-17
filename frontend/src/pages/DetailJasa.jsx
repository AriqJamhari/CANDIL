import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance, { getUploadUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import BintangRating from '../components/BintangRating';
import { User, MessageSquare, ShoppingCart, ArrowLeft, Tag, Calendar } from 'lucide-react';

const DetailJasa = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jasa, setJasa] = useState(null);
  const [ulasans, setUlasans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Order states
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Jasa detail
        const jasaRes = await axiosInstance.get(`/jasa/${id}`);
        setJasa(jasaRes.data);

        // Fetch reviews
        const ulasanRes = await axiosInstance.get(`/ulasan/jasa/${id}`);
        setUlasans(ulasanRes.data);
      } catch (err) {
        console.error(err);
        setError('Jasa tidak ditemukan atau terjadi kesalahan server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'client') {
      setOrderError('Hanya akun dengan role Client (Pembeli) yang dapat memesan jasa.');
      return;
    }

    setOrderLoading(true);
    setOrderError('');

    try {
      const res = await axiosInstance.post('/pesanan', {
        jasa_id: jasa.id,
        catatan: catatan
      });
      // Redirect to orders page on success
      navigate('/pesanan');
    } catch (err) {
      console.error(err);
      setOrderError(err.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setOrderLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--border-glass)',
          borderTopColor: 'var(--accent-purple)',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Memuat detail jasa...</span>
      </div>
    );
  }

  if (error || !jasa) {
    return (
      <div className="container section-padding">
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', marginBottom: '20px' }}>{error || 'Jasa tidak ditemukan'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Kembali ke Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in">
      {/* Back link */}
      <button 
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'var(--transition-smooth)'
        }}
        className="nav-link"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Main Grid: Details vs Pricing card */}
      <div className="detail-jasa-layout">
        {/* Left Column: Info & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Main Info */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            {/* Kategori */}
            <span style={{
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              color: 'var(--accent-teal)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              {jasa.kategori}
            </span>

            {/* Judul */}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.3 }}>
              {jasa.judul}
            </h1>

            {/* Rating Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <BintangRating rating={Math.round(jasa.rating_rata)} size={18} />
              <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '1.1rem' }}>
                {Number(jasa.rating_rata).toFixed(1)}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ({jasa.ulasan_count} Ulasan)
              </span>
            </div>

            {/* Cover Foto */}
            <div style={{
              width: '100%',
              maxHeight: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '24px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              {jasa.foto ? (
                <img 
                  src={getUploadUrl(jasa.foto)} 
                  alt={jasa.judul} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '400px' }}
                />
              ) : (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '8px' }}>
                  <Tag size={48} />
                  <span>Jasa ini tidak melampirkan foto</span>
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }} className="text-gradient">
                Deskripsi Jasa
              </h3>
              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {jasa.deskripsi}
              </p>
            </div>
          </div>

          {/* Freelancer Bio */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }} className="text-gradient">
              Tentang Freelancer
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {jasa.freelancer_foto ? (
                <img 
                  src={getUploadUrl(jasa.freelancer_foto)} 
                  alt={jasa.freelancer_nama} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
                />
              ) : (
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  {jasa.freelancer_nama.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{jasa.freelancer_nama}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Freelancer</span>
                <Link to={`/freelancer/${jasa.freelancer_id}`} style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
                  Lihat Profil Lengkap & Jasa Lainnya →
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }} className="text-gradient">
              Ulasan Pembeli ({ulasans.length})
            </h3>

            {ulasans.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                Belum ada ulasan untuk jasa ini.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ulasans.map((ulasan) => (
                  <div key={ulasan.id} style={{
                    borderBottom: '1px solid var(--border-glass)',
                    paddingBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {ulasan.client_foto ? (
                          <img 
                            src={getUploadUrl(ulasan.client_foto)} 
                            alt={ulasan.client_nama} 
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            <User size={14} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ulasan.client_nama}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(ulasan.created_at)}</span>
                    </div>

                    <BintangRating rating={ulasan.rating} size={14} />
                    
                    {ulasan.komentar && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                        "{ulasan.komentar}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Price card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Harga Jasa</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '4px' }}>
                {formatPrice(jasa.harga)}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kategori:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{jasa.kategori}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rating Rata-rata:</span>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>★ {Number(jasa.rating_rata).toFixed(1)}</span>
              </div>
            </div>

            {/* Call to action */}
            {!showOrderForm ? (
              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowOrderForm(true);
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <ShoppingCart size={18} /> Pesan Sekarang
              </button>
            ) : (
              <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orderError && (
                  <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem' }}>
                    {orderError}
                  </div>
                )}
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Catatan Pesanan (Opsional)</label>
                  <textarea 
                    className="form-control"
                    placeholder="Tuliskan spesifikasi/catatan Anda kepada freelancer..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows="4"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowOrderForm(false)} 
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '8px' }}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-teal"
                    style={{ flex: 1, padding: '8px' }}
                    disabled={orderLoading}
                  >
                    {orderLoading ? 'Memproses...' : 'Konfirmasi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .detail-jasa-layout {
            grid-template-columns: 1fr !important;
          }
          .detail-jasa-layout > div:last-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailJasa;
