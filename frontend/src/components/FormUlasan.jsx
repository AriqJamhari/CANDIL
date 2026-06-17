import React, { useState } from 'react';
import BintangRating from './BintangRating';
import axiosInstance from '../api/axiosInstance';

const FormUlasan = ({ pesananId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Silakan pilih rating bintang.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.post(`/ulasan/${pesananId}`, { rating, komentar });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '20px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }} className="text-gradient">
        Berikan Ulasan Anda
      </h3>

      {error && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Rating Stars Input */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px' }}>Rating Layanan</label>
          <BintangRating rating={rating} size={28} onChange={setRating} />
        </div>

        {/* Komentar Textarea */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Tulis Ulasan / Komentar</label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Tuliskan pengalaman Anda menggunakan jasa ini..."
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-teal"
          disabled={loading}
          style={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </form>
    </div>
  );
};

export default FormUlasan;
