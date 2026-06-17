import React from 'react';
import { Link } from 'react-router-dom';
import BintangRating from './BintangRating';
import { User, Tag } from 'lucide-react';

const KartuJasa = ({ jasa }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const roundedRating = Number(jasa.rating_rata).toFixed(1);

  return (
    <div className="glass-panel glass-panel-hover" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Jasa Foto / Thumbnail */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        {jasa.foto ? (
          <img 
            src={`http://localhost:5000/uploads/${jasa.foto}`} 
            alt={jasa.judul}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
            className="jasa-card-img"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0c0a0f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <Tag size={32} />
            <span style={{ fontSize: '0.8rem' }}>Tanpa Foto</span>
          </div>
        )}

        {/* Kategori Badge on Thumbnail */}
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(10, 7, 27, 0.75)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-glass)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent-teal)'
        }}>
          {jasa.kategori}
        </span>
      </div>

      {/* Jasa Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        {/* Title */}
        <h4 style={{
          margin: 0,
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.4',
          height: '42px'
        }}>
          {jasa.judul}
        </h4>

        {/* Freelancer Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
          {jasa.freelancer_foto ? (
            <img 
              src={`http://localhost:5000/uploads/${jasa.freelancer_foto}`} 
              alt={jasa.freelancer_nama}
              style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <User size={12} />
            </div>
          )}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {jasa.freelancer_nama}
          </span>
        </div>

        {/* Rating and Reviews count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
          <BintangRating rating={Math.round(jasa.rating_rata)} size={14} />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fbbf24' }}>
            {roundedRating}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({jasa.ulasan_count} Ulasan)
          </span>
        </div>

        {/* Price and Link */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Mulai Dari</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
              {formatPrice(jasa.harga)}
            </span>
          </div>

          <Link to={`/jasa/${jasa.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}>
              Detail
            </button>
          </Link>
        </div>
      </div>
      
      <style>{`
        .glass-panel-hover:hover .jasa-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default KartuJasa;
