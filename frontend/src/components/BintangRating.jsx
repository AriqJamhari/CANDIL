import React from 'react';
import { Star } from 'lucide-react';

const BintangRating = ({ rating, size = 18, onChange = null }) => {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <Star
            key={star}
            size={size}
            onClick={() => onChange && onChange(star)}
            style={{
              cursor: onChange ? 'pointer' : 'default',
              fill: isFilled ? '#fbbf24' : 'none',
              stroke: isFilled ? '#fbbf24' : '#64748b',
              transition: 'var(--transition-smooth)'
            }}
          />
        );
      })}
    </div>
  );
};

export default BintangRating;
