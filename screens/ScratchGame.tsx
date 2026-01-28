
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User } from '../types';

interface ScratchGameProps {
  user: User;
  onWin: (amount: number) => void;
}

const ScratchGame: React.FC<ScratchGameProps> = ({ user, onWin }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(false);
  const [reward, setReward] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [hasFreeTurn, setHasFreeTurn] = useState(false);
  const [adWatchedForCurrent, setAdWatchedForCurrent] = useState(false);

  useEffect(() => {
    checkFreeTurn();
  }, []);

  const checkFreeTurn = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastFree = localStorage.getItem('last_free_scratch_date');
    if (lastFree !== today) {
      setHasFreeTurn(true);
    } else {
      setHasFreeTurn(false);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 280;
    canvas.height = 280;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 20px Orbitron';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', 140, 140);
  };

  const startScratch = () => {
    setReward(Math.floor(Math.random() * 200) + 10); // ₹0.10 to ₹2.00
    setScratched(false);
    setTimeout(initCanvas, 0);
  };

  const handleAdWatch = () => {
    setIsAdLoading(true);
    // Simulate 3s Ad
    setTimeout(() => {
      setIsAdLoading(false);
      setAdWatchedForCurrent(true);
      startScratch();
    }, 3000);
  };

  const handleFreeStart = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('last_free_scratch_date', today);
    setHasFreeTurn(false);
    setAdWatchedForCurrent(true); // Free turn counts as having "cleared" the barrier
    startScratch();
  };

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || scratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Simple completion check
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] < 128) transparent++;
    }
    if (transparent > (canvas.width * canvas.height * 0.5) && !scratched) {
      setScratched(true);
      onWin(reward);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const resetForNext = () => {
    setReward(0);
    setAdWatchedForCurrent(false);
    checkFreeTurn();
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full flex items-center mb-10">
        <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
        <h1 className="text-xl font-gaming font-bold text-white uppercase">Instant Cash</h1>
      </div>

      {reward === 0 || !adWatchedForCurrent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-slate-900 rounded-3xl flex items-center justify-center text-6xl mb-8 border border-slate-800 shadow-2xl">🎁</div>
          {hasFreeTurn ? (
            <>
              <h2 className="text-2xl font-gaming text-white mb-4">DAILY FREE CARD!</h2>
              <button onClick={handleFreeStart} className="w-64 gradient-gold py-4 rounded-2xl font-bold text-slate-900 shadow-xl active:scale-95">OPEN FREE CARD</button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-gaming text-white mb-2">SCRATCH AGAIN</h2>
              <p className="text-slate-500 mb-8 text-sm">Watch a short ad to unlock another scratch card.</p>
              <button onClick={handleAdWatch} className="w-64 gradient-purple py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 active:scale-95">
                <span>▶️</span> WATCH AD TO PLAY
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-[280px] h-[280px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-slate-500 font-bold uppercase text-[10px]">Winnings</p>
              <p className="text-5xl font-gaming font-bold text-amber-500">🪙 {reward}</p>
              <p className="text-slate-400 font-bold mt-2">₹{(reward/100).toFixed(2)}</p>
            </div>
            <canvas ref={canvasRef} onMouseMove={handleScratch} onTouchMove={handleScratch} className="absolute inset-0 cursor-crosshair touch-none" />
          </div>
          {scratched && (
            <button onClick={resetForNext} className="mt-12 bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 active:scale-95">Next Card</button>
          )}
        </div>
      )}

      {isAdLoading && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
          <div className="w-full h-full max-w-sm flex flex-col">
            <div className="flex-1 bg-slate-900 flex items-center justify-center text-white relative">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-gaming text-sm">LOADING SPONSOR AD...</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded text-[10px]">AD: 0:03</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchGame;
