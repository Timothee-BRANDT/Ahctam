import React from 'react';

interface StarRatingProps {
    rate: number,
}

const StarRating: React.FC<StarRatingProps> = ({ rate }) => {
  const clampedRating = Math.min(Math.max(rate, 0), 5);

  const stars = Array.from({ length: 5 }, (_, index) => index < clampedRating);

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
      {stars.map((isFullStar, index) => (
        <span key={index} style={{ color: isFullStar ? 'gold' : 'gray', fontSize: '2em' }}>
          {isFullStar ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;