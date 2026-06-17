import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import StepTracker from '../components/StepTracker';
import ChatBox from '../components/ChatBox';
import FormUlasan from '../components/FormUlasan';
import BintangRating from '../components/BintangRating';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, XCircle, Play } from 'lucide-react';

const DetailPesanan = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      const res = await axiosInstance.get(`/pesanan/${id}`);
      setPesanan(res.data);
      
      // If completed, fetch reviews of this service to check if already reviewed
      if (res.data.status === 'selesai') {
        const ulasanRes = await axiosInstance.get(`/ulasan/jasa/${res.data.jasa_id}`);
        setReviews(ulasanRes.data);
        const foundReview = ulasanRes.data.find(r => Number(r.pesanan_id) === Number(id));
        if (foundReview) {
          setHasReviewed(true);
          setMyReview(foundReview);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat detail pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [id, user]);

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status pesanan menjadi "${newStatus}"?`)) return;

    setStatusLoading(true);
    try {
      await axiosInstance.patch(`/pesanan/${id}/status`, { status: newStatus });
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengubah status pesanan.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    fetchOrderDetails();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
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
        <span style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Memuat rincian pesanan...</span>
      </div>
    );
  }

  if (error || !pesanan) {
    return (
      <div className="container section-padding">
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#fca5a5', marginBottom: '20px' }}>{error || 'Pesanan tidak ditemukan'}</p>
          <button onClick={() => navigate('/pesanan')} className="btn btn-primary">Kembali ke Daftar Pesanan</button>
        </div>
      </div>
    );
  }

  const isClient = pesanan.client_id === user.id;
  const isFreelancer = pesanan.freelancer_id === user.id;

  return (
    <div className="container section-padding animate-fade-in">
      {/* Header back link */}
      <button 
        onClick={() => navigate('/pesanan')}
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
        <ArrowLeft size={16} /> Daftar Pesanan
      </button>

      {/* Main Grid: Status and Details vs Chat */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }} className="pesanan-detail-layout">
        
        {/* Left Column: Order Card & Progress Tracker & Ulasan Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Order Details Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PESANAN #{pesanan.id}</span>
              <span className={`badge badge-${pesanan.status}`}>{pesanan.status}</span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{pesanan.jasa_judul}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>
                Harga: <strong style={{ color: 'var(--accent-teal)' }}>{formatPrice(pesanan.jasa_harga)}</strong>
              </div>
              <div>
                {isFreelancer ? 'Pembeli (Client): ' : 'Penjual (Freelancer): '} 
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isFreelancer ? pesanan.client_nama : pesanan.freelancer_nama}
                </strong>
              </div>
              {pesanans => pesanan.catatan && (
                <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Catatan Pembeli:</span>
                  <p style={{ margin: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>"{pesanan.catatan}"</p>
                </div>
              )}
            </div>

            {/* Quick Actions (Update Status) */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Freelancer actions */}
              {isFreelancer && pesanan.status === 'pending' && (
                <button 
                  onClick={() => updateStatus('proses')} 
                  className="btn btn-primary"
                  disabled={statusLoading}
                  style={{ flex: 1 }}
                >
                  <Play size={16} /> Proses Pesanan
                </button>
              )}
              {isFreelancer && pesanan.status === 'proses' && (
                <button 
                  onClick={() => updateStatus('selesai')} 
                  className="btn btn-teal"
                  disabled={statusLoading}
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={16} /> Selesaikan Pesanan
                </button>
              )}

              {/* Client actions */}
              {isClient && pesanan.status === 'pending' && (
                <button 
                  onClick={() => updateStatus('dibatalkan')} 
                  className="btn btn-danger"
                  disabled={statusLoading}
                  style={{ flex: 1 }}
                >
                  <XCircle size={16} /> Batalkan Pesanan
                </button>
              )}

              {/* Admin actions (flexible) */}
              {user.role === 'admin' && (
                <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                  <span style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Actions:</span>
                  <button onClick={() => updateStatus('proses')} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px' }}>Proses</button>
                  <button onClick={() => updateStatus('selesai')} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px' }}>Selesai</button>
                  <button onClick={() => updateStatus('dibatalkan')} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px' }}>Batalkan</button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Visual Tracker */}
          <StepTracker status={pesanan.status} />

          {/* Review Area */}
          {pesanan.status === 'selesai' && (
            <>
              {isClient && !hasReviewed && (
                <FormUlasan pesananId={pesanan.id} onSuccess={handleReviewSuccess} />
              )}
              
              {hasReviewed && myReview && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#fbbf24' }}>
                    Ulasan yang Diberikan
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <BintangRating rating={myReview.rating} size={18} />
                    {myReview.komentar && (
                      <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        "{myReview.komentar}"
                      </p>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      Dikirim pada {new Date(myReview.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Real-time Socket Chat */}
        <div>
          <ChatBox pesananId={pesanan.id} />
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .pesanan-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailPesanan;
