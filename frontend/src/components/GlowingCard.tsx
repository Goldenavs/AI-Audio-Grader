// src/components/GlowingCard.tsx
import { motion } from 'framer-motion';
import { useState, type ReactNode, type CSSProperties } from 'react';

interface GlowingCardProps {
  children: ReactNode;
  accentColor: 'blue' | 'orange';
  style?: CSSProperties;
}

const GlowingCard = ({ children, accentColor, style }: GlowingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Using a rich diagonal gradient that we will shift slowly instead of spinning
  const gradientColor = accentColor === 'blue' 
    ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #0c4a6e 100%)' 
    : 'linear-gradient(135deg, #ea580c 0%, #fb923c 50%, #7c2d12 100%)';

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position: 'relative', 
        borderRadius: '24px', 
        padding: '2px', // The thickness of the animated border
        ...style 
      }}
    >
      {/* Elegant Shimmering Border */}
      <motion.div
        animate={{ 
          // Shifts the gradient position smoothly back and forth on hover
          backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
          opacity: isHovered ? 1 : 0.2
        }}
        transition={{ 
          backgroundPosition: { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "linear" },
          opacity: { duration: 0.3 }
        }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '24px',
          background: gradientColor,
          backgroundSize: '200% 200%',
          zIndex: 0,
          // Adds a soft outer glow in the specific accent color
          boxShadow: isHovered 
            ? `0 0 20px ${accentColor === 'blue' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(251, 146, 60, 0.2)'}` 
            : 'none'
        }}
      />
      
      {/* Inner Content Area */}
      <motion.div 
        animate={{ scale: isHovered ? 0.99 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          backgroundColor: 'rgba(15, 23, 42, 0.85)', // Dark slate base
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '22px', // Perfectly maps to the 24px outer radius minus 2px padding
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