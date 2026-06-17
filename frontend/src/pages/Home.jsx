import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import FilterJasa from '../components/FilterJasa';
import KartuJasa from '../components/KartuJasa';
import { Sparkles, Search } from 'lucide-react';

function MaskotHero() {
  const pesan = [
    "👋 Halo! Temukan freelancer terbaik di sini!",
    "💼 100+ jasa tersedia, mulai dari Rp 50.000!",
    "⭐ Freelancer terverifikasi & terpercaya!",
    "🚀 Proyek selesai lebih cepat bersama kami!",
    "🔒 Pembayaran aman & terjamin!",
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [coords, setCoords] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % pesan.length);
        setVisible(true);
      }, 400);
    }, 4000); // 4 seconds total cycle time
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const chars = Array.from(pesan[idx]);
    let i = 0;
    setTypedText('');
    const typingInterval = setInterval(() => {
      if (i < chars.length) {
        setTypedText(chars.slice(0, i + 1).join(''));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 35); // Fast typing speed
    return () => clearInterval(typingInterval);
  }, [idx]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;
      
      const dx = e.clientX - mascotCenterX;
      const dy = e.clientY - mascotCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxDist = 600;
      const factor = Math.min(dist / maxDist, 1);
      
      // Calculate 3D tilt angles (capped at 18 degrees)
      const angleX = -(dy / (dist || 1)) * factor * 18;
      const angleY = (dx / (dist || 1)) * factor * 18;
      
      setCoords({
        x: angleY,
        y: angleX,
        tx: (dx / (dist || 1)) * factor * 12,
        ty: (dy / (dist || 1)) * factor * 12
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        perspective: '1000px',
        width: '100%',
        maxWidth: '320px',
        height: '320px'
      }}
    >
      {/* Speech Bubble */}
      <div style={{
        position: 'absolute', 
        top: '-40px',
        background: '#150f2e', 
        border: '1.5px solid #A855F7',
        borderRadius: '16px', 
        padding: '12px 18px',
        width: '260px', 
        minHeight: '68px',
        fontSize: '14px', 
        fontWeight: 600,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        zIndex: 10,
        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <span>{typedText}</span>
        {/* Ekor segitiga luar */}
        <div style={{
          position: 'absolute', bottom: '-10px', left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid #A855F7',
        }} />
        {/* Ekor segitiga dalam (untuk overlap background) */}
        <div style={{
          position: 'absolute', bottom: '-8px', left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '9px solid #150f2e',
        }} />
      </div>

      {/* Floating Parent Wrapper */}
      <div style={{
        animation: 'floatingOnly 3s ease-in-out infinite',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Maskot dengan animasi tilt kursor */}
        <img
          src="/logo.png"
          alt="Candil Mascot"
          style={{
            width: '100%',
            maxWidth: '260px',
            height: 'auto',
            aspectRatio: '1/1',
            objectFit: 'contain',
            transform: `rotateX(${coords.y}deg) rotateY(${coords.x}deg) translate(${coords.tx}px, ${coords.ty}px)`,
            transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
            filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.7))',
            animation: 'glowPulse 2.5s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        />
      </div>
    </div>
  );
}

const Home = () => {
  const [jasas, setJasas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    kategori: '',
    harga_min: '',
    harga_max: '',
    q: ''
  });

  const fetchJasas = async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.kategori) queryParams.append('kategori', currentFilters.kategori);
      if (currentFilters.harga_min) queryParams.append('harga_min', currentFilters.harga_min);
      if (currentFilters.harga_max) queryParams.append('harga_max', currentFilters.harga_max);
      if (currentFilters.q) queryParams.append('q', currentFilters.q);

      const res = await axiosInstance.get(`/jasa?${queryParams.toString()}`);
      setJasas(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar jasa. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJasas(filters);
  }, []);

  const handleFilterChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    fetchJasas(updatedFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = { kategori: '', harga_min: '', harga_max: '', q: '' };
    setFilters(defaultFilters);
    fetchJasas(defaultFilters);
  };

  return (
    <div className="container section-padding animate-fade-in">
      {/* Hero Section */}
      <div 
        className="glass-panel hero-container" 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '40px',
          padding: '48px',
          marginBottom: '40px',
          background: 'radial-gradient(circle at 80% 50%, rgba(124, 58, 237, 0.22) 0%, transparent 60%), rgba(15, 12, 26, 0.6)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div className="hero-left" style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
            Temukan Jasa Freelance <span className="text-gradient">Terbaik</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '540px', margin: 0 }}>
            Selesaikan proyek Anda dengan bantuan talenta digital terbaik. Cepat, aman, dan profesional.
          </p>
          
          {/* Search Bar in Hero */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', marginTop: '12px' }}>
            <input
              type="text"
              name="q"
              placeholder="Cari judul atau kata kunci..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="form-control"
              style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button 
              onClick={() => {
                const el = document.getElementById('daftar-jasa');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="btn btn-primary" 
              style={{ padding: '12px 24px', borderRadius: '12px' }}
            >
              Mulai Mencari
            </button>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button 
                className="btn btn-outline" 
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-right" style={{ width: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <MaskotHero />
        </div>
      </div>

      {/* Filter Component */}
      <div id="daftar-jasa">
        <FilterJasa 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onReset={handleResetFilters} 
        />
      </div>

      {/* Content Area */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#fca5a5',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
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
            borderTopColor: 'var(--accent-teal)',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>Mencari jasa untuk Anda...</span>
        </div>
      ) : jasas.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Sparkles size={48} style={{ marginBottom: '16px', color: 'var(--accent-purple)' }} />
          <h3>Tidak Ada Jasa Ditemukan</h3>
          <p style={{ marginTop: '8px' }}>Coba ubah kata kunci pencarian atau bersihkan filter untuk melihat semua opsi.</p>
        </div>
      ) : (
        <div className="grid-jasa">
          {jasas.map((jasa) => (
            <KartuJasa key={jasa.id} jasa={jasa} />
          ))}
        </div>
      )}

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes floatingOnly {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(168,85,247,0.6)); }
          50%       { filter: drop-shadow(0 0 28px rgba(168,85,247,1)); }
        }
        @media (max-width: 768px) {
          .hero-container {
            flex-direction: column-reverse !important;
            padding: 60px 20px 32px 20px !important;
            text-align: center;
          }
          .hero-container h1 {
            font-size: 2.2rem !important;
          }
          .hero-left {
            width: 100% !important;
            align-items: center;
          }
          .hero-left p {
            margin: 0 auto !important;
            font-size: 0.95rem !important;
          }
          .hero-left div {
            justify-content: center;
          }
          .hero-right {
            width: 100% !important;
            margin-bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
