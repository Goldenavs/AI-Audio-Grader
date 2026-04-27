// src/components/GlowingCard.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

interface GlowingCardProps {
  children: React.ReactNode;
  accentColor: 'blue' | 'orange';
  style?: React.CSSProperties;
}

const GlowingCard = ({ children, accentColor, style }: GlowingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const gradientColor = accentColor === 'blue' 
    ? 'conic-gradient(from 0deg, transparent 70%, #0284c7 80%, #38bdf8 100%)' 
    : 'conic-gradient(from 0deg, transparent 70%, #ea580c 80%, #fb923c 100%)';

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position: 'relative', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        padding: '2px', // The thickness of the animated border
        ...style 
      }}
    >
      {/* The Spinning Border Element */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          background: gradientColor,
          transformOrigin: '0 0',
          animation: 'spin 4s linear infinite',
          opacity: isHovered ? 1 : 0.15,
          transition: 'opacity 0.4s ease',
          zIndex: 0,
        }}
      />
      
      {/* The Inner Content Area */}
      <motion.div 
        animate={{ scale: isHovered ? 0.99 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // Dark slate base
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '22px', 
          height: '100%',
          padding: '30px',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default GlowingCard;