import React from 'react';

// OPTIMIZATION: Memoize to prevent re-renders
const AnimatedBackground = React.memo(({ children }) => { // <--- 1. Added 'children' here
  return (
    <div className="relative min-h-screen w-full bg-slate-900 overflow-hidden">
      
      {/* --- BACKGROUND BLOBS (Fixed Position) --- */}
      <div 
        className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {/* --- GIANT BLOBS --- */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full 
                        mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>

        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-600 rounded-full 
                        mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

        <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-pink-600 rounded-full 
                        mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-600 rounded-full 
                        mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-1000"></div>

        {/* --- SMALLER BLOBS --- */}
        <div className="absolute top-[20%] right-[20%] w-32 h-32 bg-red-500 rounded-full 
                        mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>

        <div className="absolute bottom-[30%] left-[40%] w-32 h-32 bg-green-500 rounded-full 
                        mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* --- CONTENT LAYER (This was missing!) --- */}
      <div className="relative z-10 p-6"> {/* <--- 2. This renders your GlassCard and Grid */}
        {children}
      </div>

    </div>
  );
});

export default AnimatedBackground;