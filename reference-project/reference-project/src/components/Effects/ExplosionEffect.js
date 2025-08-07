import React, { useEffect, useState } from 'react';
import './ExplosionEffect.css';

const ExplosionEffect = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="explosion-container">
      <div className="explosion">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      <div className="flash"></div>
    </div>
  );
};

export default ExplosionEffect;