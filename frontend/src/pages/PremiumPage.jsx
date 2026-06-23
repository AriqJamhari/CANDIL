import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Award, Zap, CheckCircle2, AlertTriangle, Upload, HelpCircle } from 'lucide-react';
import { getUploadUrl } from '../api/axiosInstance';

const PremiumPage = () => {
  const { user } = useAuth();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [paket, setPaket] = useState('monthly');
  const [buktiBayar, setBuktiBayar] = useState(null);
  const [buktiBayarPreview, setBuktiBayarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchPremiumStatus = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/premium/status');
      setStatusData(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat status premium Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiBayar(file);
      setBuktiBayarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buktiBayar) {
      setSubmitError('Harap upload bukti pembayaran terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    const formData = new FormData();
    formData.append('paket', paket);
    formData.append('bukti_bayar', buktiBayar);

    try {
      const res = await axiosInstance.post('/premium/ajukan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSubmitSuccess(res.data.message || 'Pengajuan premium berhasil dikirim!');
      setBuktiBayar(null);
      setBuktiBayarPreview(null);
      // Reload status after submission
      await fetchPremiumStatus();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Gagal mengirim pengajuan premium.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--border-glass)',
          borderTopColor: 'var(--accent-purple)',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)' }}>Memuat status premium...</span>
      </div>
    );
  }

  return (
    <div className="container section-padding animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="text-gradient">
          Candil Skill Premium
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.05rem' }}>
          Tingkatkan profil freelancer Anda dan capai lebih banyak klien potensial.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', textAlign: 'center', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* SECTION A — Status Akun Premium */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        {statusData?.is_premium && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
            color: '#07050d', fontSize: '0.75rem', fontWeight: 800,
            padding: '6px 20px', transform: 'rotate(45deg) translate(28px, -10px)',
            width: '140px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            PREMIUM
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: statusData?.is_premium ? 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)' : 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: statusData?.is_premium ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none',
            color: statusData?.is_premium ? '#07050d' : 'var(--text-secondary)'
          }}>
            {statusData?.is_premium ? <Award size={36} /> : <Zap size={36} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              Status Akun: {statusData?.is_premium ? (
                <span style={{ color: '#ffd700' }}>⭐ Premium Aktif</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Gratis</span>
              )}
            </h3>
            {statusData?.is_premium ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                Keanggotaan premium Anda berlaku hingga: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(statusData.premium_until)}</strong>
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Daftar sekarang untuk membuka semua fitur eksklusif freelancer.
              </p>
            )}
          </div>
        </div>

        {/* Perbandingan Gratis vs Premium */}
        {!statusData?.is_premium && (
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Perbandingan Paket</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                <h5 style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Akun Gratis</h5>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li>❌ Tanpa badge premium</li>
                  <li>❌ Urutan pencarian normal</li>
                  <li>❌ Support standard</li>
                  <li>❌ Batas upload foto standard</li>
                </ul>
              </div>
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 215, 0, 0.03)', borderColor: 'rgba(255, 215, 0, 0.2)' }}>
                <h5 style={{ fontWeight: 700, color: '#ffd700' }}>Premium Membership</h5>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <li>✅ Badge "⭐ Premium" di profil & jasa</li>
                  <li>✅ Jasa tampil di paling atas</li>
                  <li>✅ Highlight card emas berkilau</li>
                  <li>✅ Dukungan prioritas 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B — Benefit Premium */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} style={{ color: '#ffd700' }} /> Keuntungan Anggota Premium
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Badge "⭐ Premium"', desc: 'Dapatkan lencana emas premium pada kartu jasa dan halaman profil Anda.' },
            { title: 'Prioritas Pencarian', desc: 'Jasa Anda akan diprioritaskan muncul di urutan teratas hasil pencarian klien.' },
            { title: 'Gold Highlight Card', desc: 'Desain kartu jasa dengan border emas bercahaya agar menonjol dari yang lain.' },
            { title: 'Upload Hingga 10 Foto', desc: 'Upload hingga 10 foto portofolio per jasa untuk menarik minat pembeli (Free: 1 foto).' },
            { title: 'Statistik Jasa', desc: 'Analisis performa kunjungan dan interaksi jasa Anda secara mendalam (Segera hadir).' },
            { title: 'Prioritas Dukungan', desc: 'Dapatkan respon tiket bantuan lebih cepat dari tim admin Candil Skill.' }
          ].map((benefit, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '12px' }}>
              <CheckCircle2 size={20} style={{ color: '#ffd700', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{benefit.title}</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C — Form Ajukan Premium */}
      {!statusData?.is_premium && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
            Upgrade ke Premium Sekarang
          </h3>

          {statusData?.last_request?.status === 'pending' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '12px', color: '#fdba74', textAlign: 'center' }}>
              <AlertTriangle size={32} />
              <div>
                <h5 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Pengajuan Sedang Diproses</h5>
                <p style={{ fontSize: '0.85rem', marginTop: '4px', color: 'rgba(253, 186, 116, 0.8)' }}>
                  Pengajuan paket <strong>{statusData.last_request.paket === 'monthly' ? 'Bulanan' : 'Tahunan'}</strong> Anda sedang diverifikasi oleh admin. Kami akan mengirimkan notifikasi setelah disetujui.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {statusData?.last_request?.status === 'rejected' && (
                <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.9rem', marginBottom: '24px' }}>
                  <strong style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>⚠️ Pengajuan Sebelumnya Ditolak</strong>
                  Alasan: {statusData.last_request.catatan_admin || 'Tidak ada catatan khusus.'}
                </div>
              )}

              {submitSuccess && (
                <div style={{ padding: '16px', backgroundColor: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '12px', color: '#5eead4', textAlign: 'center', marginBottom: '24px' }}>
                  {submitSuccess}
                </div>
              )}

              {submitError && (
                <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', textAlign: 'center', marginBottom: '24px' }}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Pilih Paket */}
                <div>
                  <label className="form-label">Pilih Paket Premium</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                    {/* Bulanan */}
                    <div 
                      onClick={() => setPaket('monthly')}
                      className="glass-panel" 
                      style={{
                        padding: '20px', cursor: 'pointer', transition: 'var(--transition-smooth)',
                        borderColor: paket === 'monthly' ? 'var(--accent-purple)' : 'var(--border-glass)',
                        background: paket === 'monthly' ? 'rgba(171, 134, 235, 0.05)' : 'var(--bg-glass)',
                        boxShadow: paket === 'monthly' ? 'var(--shadow-neon)' : 'none'
                      }}
                    >
                      <h4 style={{ fontWeight: 700 }}>Paket Bulanan</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Langganan 30 hari</p>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '12px' }}>
                        Rp 99.000 <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ bulan</span>
                      </div>
                    </div>

                    {/* Tahunan */}
                    <div 
                      onClick={() => setPaket('yearly')}
                      className="glass-panel" 
                      style={{
                        padding: '20px', cursor: 'pointer', transition: 'var(--transition-smooth)',
                        borderColor: paket === 'yearly' ? 'var(--accent-purple)' : 'var(--border-glass)',
                        background: paket === 'yearly' ? 'rgba(171, 134, 235, 0.05)' : 'var(--bg-glass)',
                        boxShadow: paket === 'yearly' ? 'var(--shadow-neon)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)',
                        color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 8px', borderRadius: '12px'
                      }}>
                        Hemat 33%
                      </span>
                      <h4 style={{ fontWeight: 700 }}>Paket Tahunan</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Langganan 365 hari</p>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '12px' }}>
                        Rp 799.000 <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ tahun</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Informasi Pembayaran */}
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Transfer Pembayaran</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Harap transfer nominal sesuai paket pilihan Anda ke salah satu rekening resmi di bawah ini:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bank BCA</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>1234567890</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>a/n Candil Skill Platform</span>
                    </div>
                    <div style={{ borderLeft: '3px solid var(--accent-teal)', paddingLeft: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>DANA / GoPay</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>081234567890</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>a/n Candil Skill</span>
                    </div>
                  </div>
                </div>

                {/* 3. Upload Bukti */}
                <div>
                  <label className="form-label">Upload Bukti Pembayaran</label>
                  <div style={{ 
                    border: '2px dashed var(--border-glass)', borderRadius: '12px',
                    padding: '24px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px', cursor: 'pointer',
                    transition: 'var(--transition-smooth)', position: 'relative',
                    background: 'rgba(0,0,0,0.15)'
                  }} onClick={() => document.getElementById('bukti-bayar-input').click()}>
                    <input 
                      type="file" 
                      id="bukti-bayar-input" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                    />
                    
                    {buktiBayarPreview ? (
                      <div style={{ position: 'relative', width: '100%', maxWidth: '240px', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img 
                          src={buktiBayarPreview} 
                          alt="Preview bukti bayar" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px', background: 'rgba(0,0,0,0.6)', textAlign: 'center', fontSize: '0.75rem', color: 'white' }}>
                          Klik untuk ganti
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} style={{ color: 'var(--accent-purple)' }} />
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Pilih file gambar bukti bayar</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mendukung format JPG, PNG, WEBP (Max 5MB)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px', display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  {submitting ? (
                    <>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                      Mengajukan...
                    </>
                  ) : (
                    'Ajukan Premium'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
