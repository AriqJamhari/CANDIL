import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance, { getUploadUrl } from '../api/axiosInstance';
import KartuJasa from '../components/KartuJasa';
import { ArrowLeft, User, MessageSquare, Mail, Award, CheckCircle } from 'lucide-react';

const ProfilFreelancer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jasas, setJasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Query services by this freelancer
        const res = await axiosInstance.get(`/jasa?freelancer_id=${id}`);
        setJasas(res.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat profil freelancer.');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerProfile();
  }, [id]);

  // Extract freelancer details from the first service (if available)
  const profile = jasas.length > 0 ? {
    nama: jasas[0].freelancer_nama,
    foto: jasas[0].freelancer_foto,
    email: jasas[0].freelancer_email || 'Kontak via chat pesanan'
  } : null;

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
        <span style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Memuat profil freelancer...</span>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in">
      {/* Back button */}
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

      {/* Freelancer Header card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {profile?.foto ? (
            <img 
              src={getUploadUrl(profile.foto)} 
              alt={profile.nama} 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-purple)', boxShadow: 'var(--shadow-neon)' }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '2rem',
              boxShadow: 'var(--shadow-neon)'
            }}>
              {profile?.nama ? profile.nama.charAt(0).toUpperCase() : <User size={36} />}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{profile?.nama || 'Profil Freelancer'}</h2>
              <CheckCircle size={18} style={{ color: 'var(--accent-teal)' }} />
            </div>
            
            <span style={{ 
              alignSelf: 'flex-start',
              fontSize: '0.75rem', 
              color: 'var(--accent-purple)', 
              fontWeight: 'bold', 
              textTransform: 'uppercase',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(139, 92, 246, 0.08)'
            }}>
              Verified Freelancer
            </span>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Mail size={14} /> {profile?.email || 'Hubungi melalui detail jasa'}
            </p>
          </div>

          {/* Stats on the right */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '24px',
            background: 'rgba(255,255,255,0.03)',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)'
          }} className="freelancer-stats">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)' }}>{jasas.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Jasa</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '24px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
                ★ {jasas.length > 0 
                  ? (jasas.reduce((acc, j) => acc + Number(j.rating_rata), 0) / jasas.length).toFixed(1)
                  : '0.0'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Rating Rata-rata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services List Section */}
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }} className="text-gradient">
          Jasa yang Ditawarkan
        </h3>

        {jasas.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Award size={36} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
            <p>Freelancer ini belum menerbitkan jasa apa pun.</p>
          </div>
        ) : (
          <div className="grid-jasa">
            {jasas.map((jasa) => (
              <KartuJasa key={jasa.id} jasa={jasa} />
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        @media (max-width: 600px) {
          .freelancer-stats {
            margin-left: 0 !important;
            width: 100%;
            justify-content: space-around;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilFreelancer;
