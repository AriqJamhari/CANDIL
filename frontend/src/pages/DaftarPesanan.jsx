import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance, { getUploadUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';

const DaftarPesanan = () => {
  const { user } = useAuth();
  const [pesanans, setPesanans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/pesanan');
      setPesanans(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar pesanan Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Daftar Pesanan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {user?.role === 'client' 
            ? 'Pantau progress pengerjaan jasa yang Anda pesan di sini' 
            : 'Kelola orderan masuk dari client Anda dan update progressnya'}
        </p>
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
          <span style={{ color: 'var(--text-secondary)' }}>Memuat daftar pesanan Anda...</span>
        </div>
      ) : pesanans.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3>Belum Ada Pesanan</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>
            {user?.role === 'client' 
              ? 'Anda belum memesan jasa apa pun. Jelajahi layanan di beranda untuk memulai!' 
              : 'Belum ada pesanan masuk untuk jasa Anda. Tingkatkan kualitas deskripsi jasa Anda!'}
          </p>
          {user?.role === 'client' && (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">Cari Layanan Jasa</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pesanans.map((pesanan) => {
            const isFreelancer = user?.role === 'freelancer';
            return (
              <div 
                key={pesanan.id} 
                className="glass-panel" 
                style={{
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative'
                }}
              >
                {/* Jasa Thumbnail */}
                <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-secondary)' }}>
                  {pesanan.jasa_foto ? (
                    <img 
                      src={getUploadUrl(pesanan.jasa_foto)} 
                      alt={pesanan.jasa_judul} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      No Pic
                    </div>
                  )}
                </div>

                {/* Order Meta Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDER #{pesanan.id}</span>
                    <span className={getStatusBadgeClass(pesanan.status)}>{pesanan.status}</span>
                  </div>
                  
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{pesanan.jasa_judul}</h3>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>
                      {isFreelancer ? 'Pembeli: ' : 'Freelancer: '}
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {isFreelancer ? pesanan.client_nama : pesanan.freelancer_nama}
                      </strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(pesanan.created_at)}
                    </span>
                  </div>
                </div>

                {/* Price and Details Action Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                    {formatPrice(pesanan.jasa_harga)}
                  </span>
                  
                  <Link to={`/pesanan/${pesanan.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Detail Pesanan <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DaftarPesanan;
