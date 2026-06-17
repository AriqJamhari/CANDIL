import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const FilterJasa = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    'Desain Grafis',
    'Pemrograman & IT',
    'Penulisan & Penerjemahan',
    'Pemasaran Digital',
    'Video & Animasi',
    'Audio & Musik',
    'Lainnya'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }} className="text-gradient">
        Filter Pencarian
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        alignItems: 'end'
      }}>
        {/* Search */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Cari Jasa</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="q"
              placeholder="Cari judul atau kata kunci..."
              value={filters.q}
              onChange={handleInputChange}
              className="form-control"
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Kategori */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Kategori</label>
          <select
            name="kategori"
            value={filters.kategori}
            onChange={handleInputChange}
            className="form-control"
            style={{ appearance: 'none' }}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Harga Min */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Harga Minimum (Rp)</label>
          <input
            type="number"
            name="harga_min"
            placeholder="0"
            value={filters.harga_min}
            onChange={handleInputChange}
            className="form-control"
            min="0"
          />
        </div>

        {/* Harga Max */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Harga Maksimum (Rp)</label>
          <input
            type="number"
            name="harga_max"
            placeholder="Max"
            value={filters.harga_max}
            onChange={handleInputChange}
            className="form-control"
            min="0"
          />
        </div>

        {/* Reset Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={onReset}
            className="btn btn-outline"
            style={{ 
              width: '100%', 
              padding: '11px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={16} /> Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterJasa;
