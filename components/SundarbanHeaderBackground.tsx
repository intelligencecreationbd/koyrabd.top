import React from 'react';

const SundarbanHeaderBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* High Quality Sundarban Landscape Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&q=80&w=1200" 
          alt="Sundarban River"
          className="w-full h-full object-cover object-center scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlays for depth and text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Sundarban Mangrove Silhouette Overlays - Left */}
      <div className="absolute bottom-0 left-0 w-[35%] h-full flex items-end opacity-80 z-10">
        <div className="relative w-full h-[80%]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute bottom-[-5px]" style={{ left: `${i * 30 - 10}%`, width: '60%', height: '100%' }}>
              <MangroveTree color="#064e3b" />
            </div>
          ))}
        </div>
      </div>

      {/* Sundarban Mangrove Silhouette Overlays - Right */}
      <div className="absolute bottom-0 right-0 w-[35%] h-full flex items-end opacity-80 z-10">
        <div className="relative w-full h-[80%] transform scale-x-[-1]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute bottom-[-5px]" style={{ left: `${i * 30 - 10}%`, width: '60%', height: '100%' }}>
              <MangroveTree color="#064e3b" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Animated River Waves at the bottom */}
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

      {/* Flying Birds */}
      <div className="absolute inset-0 z-30">
        <div className="bird-container bird-container--one">
          <div className="bird bird--one"></div>
        </div>
        <div className="bird-container bird-container--two">
          <div className="bird bird--two"></div>
        </div>
        <div className="bird-container bird-container--three">
          <div className="bird bird--three"></div>
        </div>
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

        @keyframes fly-cycle {
          100% { background-position: -900px 0; }
        }
        
        @keyframes fly-right {
          0% { transform: scale(0.3) translateX(-10vw); opacity: 0; }
          10% { transform: translateY(2vh) scale(0.35) translateX(10vw); opacity: 1; }
          50% { transform: translateY(0vh) scale(0.4) translateX(60vw); }
          90% { transform: translateY(2vh) scale(0.35) translateX(110vw); opacity: 1; }
          100% { transform: translateY(2vh) scale(0.35) translateX(120vw); opacity: 0; }
        }

        .bird {
          background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/174479/bird-cells-new.svg');
          background-size: auto 100%;
          width: 88px;
          height: 125px;
          will-change: background-position;
          animation: fly-cycle 1s steps(10) infinite;
          filter: brightness(0) invert(1);
        }

        .bird-container {
          position: absolute;
          top: 20%;
          left: -10%;
          will-change: transform;
          animation: fly-right 25s linear infinite;
        }

        .bird-container--one { animation-delay: 0s; top: 15%; }
        .bird-container--two { animation-delay: 8s; top: 25%; animation-duration: 30s; }
        .bird-container--three { animation-delay: 15s; top: 10%; animation-duration: 22s; }
      `}</style>
    </div>
  );
};

const MangroveTree: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 200 300" className="w-full h-full" style={{ color }}>
    {/* Mangrove Roots (Pneumatophores) */}
    <path d="M70,300 L75,270 M85,300 L88,260 M115,300 L112,265 M125,300 L120,275 M100,300 L100,250" stroke="currentColor" strokeWidth="4" fill="none" />
    {/* Trunk */}
    <path d="M90,250 L110,250 L105,150 L95,150 Z" fill="currentColor" />
    {/* Lush Foliage */}
    <path d="M100,30 C150,30 190,80 190,160 C190,200 150,220 100,220 C50,220 10,200 10,160 C10,80 50,30 100,30 Z" fill="currentColor" />
  </svg>
);

export default SundarbanHeaderBackground;
