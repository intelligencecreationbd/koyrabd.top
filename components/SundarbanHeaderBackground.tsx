import React from 'react';

const SundarbanHeaderBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#334155] to-[#475569]" />
      
      {/* Distant Forest Silhouette */}
      <div className="absolute bottom-6 left-0 right-0 h-16 opacity-30 flex items-end justify-around blur-[1px]">
        {[...Array(15)].map((_, i) => (
          <svg key={i} viewBox="0 0 100 100" className="h-full text-[#064e3b] fill-current">
            <path d="M50,0 C70,40 100,60 100,100 L0,100 C0,60 30,40 50,0 Z" />
          </svg>
        ))}
      </div>

      {/* Sundarban Trees - Left Side */}
      <div className="absolute bottom-0 left-0 w-[45%] h-full flex items-end justify-start z-10">
        <div className="relative w-full h-full">
          {/* Back layer trees */}
          <div className="absolute bottom-0 left-0 w-full h-[80%] opacity-40 blur-[0.5px]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 200 200" className="absolute bottom-0 text-[#064e3b] fill-current" style={{ left: `${i * 15}%`, width: '40%', height: '60%' }}>
                <path d="M100,0 C140,40 180,80 180,140 C180,180 140,200 100,200 C60,200 20,180 20,140 C20,80 60,40 100,0 Z" />
              </svg>
            ))}
          </div>
          {/* Front layer trees */}
          <div className="absolute bottom-0 left-0 w-full h-[60%]">
            {[...Array(4)].map((_, i) => (
              <svg key={i} viewBox="0 0 200 200" className="absolute bottom-[-10px] text-[#065f46] fill-current" style={{ left: `${i * 20 - 10}%`, width: '45%', height: '70%' }}>
                <path d="M100,0 C140,40 180,80 180,140 C180,180 140,200 100,200 C60,200 20,180 20,140 C20,80 60,40 100,0 Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Sundarban Trees - Right Side */}
      <div className="absolute bottom-0 right-0 w-[45%] h-full flex items-end justify-end z-10">
        <div className="relative w-full h-full">
          {/* Back layer trees */}
          <div className="absolute bottom-0 right-0 w-full h-[80%] opacity-40 blur-[0.5px]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 200 200" className="absolute bottom-0 text-[#064e3b] fill-current transform scale-x-[-1]" style={{ right: `${i * 15}%`, width: '40%', height: '60%' }}>
                <path d="M100,0 C140,40 180,80 180,140 C180,180 140,200 100,200 C60,200 20,180 20,140 C20,80 60,40 100,0 Z" />
              </svg>
            ))}
          </div>
          {/* Front layer trees */}
          <div className="absolute bottom-0 right-0 w-full h-[60%]">
            {[...Array(4)].map((_, i) => (
              <svg key={i} viewBox="0 0 200 200" className="absolute bottom-[-10px] text-[#065f46] fill-current transform scale-x-[-1]" style={{ right: `${i * 20 - 10}%`, width: '45%', height: '70%' }}>
                <path d="M100,0 C140,40 180,80 180,140 C180,180 140,200 100,200 C60,200 20,180 20,140 C20,80 60,40 100,0 Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* River with Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-14 z-20">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 100">
          <path 
            fill="#475569" 
            fillOpacity="0.6" 
            d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
            className="animate-wave"
          />
          <path 
            fill="#64748b" 
            fillOpacity="0.4" 
            d="M0,60 C240,30 480,90 720,60 C960,30 1200,90 1440,60 L1440,100 L0,100 Z"
            className="animate-wave-slow"
          />
        </svg>
      </div>

      {/* Mist/Fog Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent z-25 pointer-events-none" />

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

        <div className="bird-container bird-container--four">
          <div className="bird bird--four"></div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-1%) scaleY(1.1); }
        }
        @keyframes wave-slow {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(1%) scaleY(0.9); }
        }
        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }
        .animate-wave-slow {
          animation: wave-slow 6s ease-in-out infinite;
        }

        @keyframes fly-cycle {
          100% { background-position: -900px 0; }
        }
        
        @keyframes fly-right-one {
          0% { transform: scale(0.3) translateX(-10vw); opacity: 0; }
          10% { transform: translateY(2vh) scale(0.4) translateX(10vw); opacity: 1; }
          20% { transform: translateY(0vh) scale(0.5) translateX(30vw); }
          30% { transform: translateY(4vh) scale(0.6) translateX(50vw); }
          40% { transform: translateY(2vh) scale(0.6) translateX(70vw); }
          50% { transform: translateY(0vh) scale(0.6) translateX(90vw); }
          60% { transform: translateY(0vh) scale(0.6) translateX(110vw); opacity: 0; }
          100% { transform: translateY(0vh) scale(0.6) translateX(110vw); opacity: 0; }
        }
        
        @keyframes fly-right-two {
          0% { transform: translateY(-2vh) translateX(-10vw) scale(0.5); opacity: 0; }
          10% { transform: translateY(0vh) translateX(10vw) scale(0.4); opacity: 1; }
          20% { transform: translateY(-4vh) translateX(30vw) scale(0.6); }
          30% { transform: translateY(1vh) translateX(50vw) scale(0.45); }
          40% { transform: translateY(-2.5vh) translateX(70vw) scale(0.5); }
          50% { transform: translateY(0vh) translateX(90vw) scale(0.45); }
          60% { transform: translateY(0vh) translateX(110vw) scale(0.45); opacity: 0; }
          100% { transform: translateY(0vh) translateX(110vw) scale(0.45); opacity: 0; }
        }

        .bird {
          background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/174479/bird-cells-new.svg');
          background-size: auto 100%;
          width: 88px;
          height: 125px;
          will-change: background-position;
          animation-name: fly-cycle;
          animation-timing-function: steps(10);
          animation-iteration-count: infinite;
          filter: brightness(0) invert(1); /* Make birds white */
        }

        .bird--one { animation-duration: 1s; animation-delay: -0.5s; }
        .bird--two { animation-duration: 0.9s; animation-delay: -0.75s; }
        .bird--three { animation-duration: 1.25s; animation-delay: -0.25s; }
        .bird--four { animation-duration: 1.1s; animation-delay: -0.1s; }

        .bird-container {
          position: absolute;
          top: 30%;
          left: -10%;
          transform: scale(0) translateX(-10vw);
          will-change: transform;
          animation-name: fly-right-one;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .bird-container--one { animation-duration: 15s; animation-delay: 0s; }
        .bird-container--two { animation-duration: 16s; animation-delay: 1s; animation-name: fly-right-two; }
        .bird-container--three { animation-duration: 14.6s; animation-delay: 9.5s; }
        .bird-container--four { animation-duration: 18s; animation-delay: 5s; top: 45%; }
      `}</style>
    </div>
  );
};

export default SundarbanHeaderBackground;
