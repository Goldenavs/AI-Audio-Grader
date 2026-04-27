// src/components/InteractiveBackground.tsx
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth mouse follower for the gradient orb
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springConfig = { damping: 30, stiffness: 300, mass: 0.2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half the width/height of the glowing orb (800x800)
      mouseX.set(e.clientX - 400);
      mouseY.set(e.clientY - 400);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseSize: number;
      
      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slower, more atmospheric drift
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.baseSize = Math.random() * 2 + 0.5;
      }

      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen instead of bouncing for a continuous flow
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Magnetic pull/push from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          // Gently push particles away like a magnetic field
          const force = (200 - distance) / 200;
          this.x -= (dx / distance) * force * 1.5;
          this.y -= (dy / distance) * force * 1.5;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; // Faint Cyan
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes if they are close
          if (distance < 150) {
            const mouseDist = Math.sqrt(Math.pow(mouse.x - particles[i].x, 2) + Math.pow(mouse.y - particles[i].y, 2));
            
            ctx.beginPath();
            if (mouseDist < 250) {
              // Light up Orange/Cyan when mouse is near
              const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
              gradient.addColorStop(0, `rgba(56, 189, 248, ${0.8 - distance/150})`); // Blue
              gradient.addColorStop(1, `rgba(251, 146, 60, ${0.8 - distance/150})`);  // Orange
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.5;
            } else {
              // Faint background connections
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 - distance / 3000})`;
              ctx.lineWidth = 0.5;
            }

            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', backgroundColor: '#030712' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <div className="noise-overlay" />
      
        {/* Dual-tone wandering spotlight tied to mouse */}
      <motion.div
        className="will-change-transform"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          // Combined styles here:
          x: smoothX, 
          y: smoothY, 
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(251,146,60,0.05) 40%, rgba(0,0,0,0) 70%)',
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '800px', 
          height: '800px', 
          borderRadius: '50%', 
          pointerEvents: 'none' 
        }}
      />
    </div>
  );
};

export default InteractiveBackground;