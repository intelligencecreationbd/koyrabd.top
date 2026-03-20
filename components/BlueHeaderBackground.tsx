import React from 'react';

const BlueHeaderBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0056b3]">
      {/* Blue gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#004494] to-[#0056b3]" />
      
      {/* Subtle patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Animated River Waves at the bottom - keeping them for some texture, but making them subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-10 z-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 100">
          <path 
            fill="#ffffff" 
            fillOpacity="0.1" 
            d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
            className="animate-wave"
          />
          <path 
            fill="#ffffff" 
            fillOpacity="0.05" 
            d="M0,60 C240,30 480,90 720,60 C960,30 1200,90 1440,60 L1440,100 L0,100 Z"
            className="animate-wave-slow"
          />
        </svg>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-1%) scaleY(1.2); }
        }
        @keyframes wave-slow {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(1%) scaleY(0.8); }
        }
        .animate-wave { animation: wave 6s ease-in-out infinite; }
        .animate-wave-slow { animation: wave-slow 9s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BlueHeaderBackground;
