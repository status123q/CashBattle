
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User } from '../types';

interface SpinWheelProps {
  user: User;
  onWin: (amount: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ user, onWin }) => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasFreeTurn, setHasFreeTurn] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adWatchedForCurrent, setAdWatchedForCurrent] = useState(false);

  useEffect(() => {
    checkFreeTurn();
  }, []);

  const checkFreeTurn = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastFree = localStorage.getItem('last_free_spin_date');
    if (lastFree !== today) {
      setHasFreeTurn(true);
    } else {
      setHasFreeTurn(false);
    }
  };

  const segments = [
    { value: 50, color: '#6b21a8' },
    { value: 10, color: '#1e3a8a' },
    { value: 100, color: '#b45309' },
    { value: 0, color: '#475569' },
    { value: 200, color: '#9d174d' },
    { value: 20, color: '#064e3b' },
  ];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const extraDeg = Math.floor(Math.random() * 360);
    const newRot = rotation + (360 * 5) + extraDeg;
    setRotation(newRot);

    setTimeout(() => {
      setSpinning(false);
      const finalDeg = extraDeg % 360;
      const index = Math.floor((360 - finalDeg) / 60) % 6;
      const won = segments[index].value;
      if (won > 0) {
        onWin(won);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      // After spinning, reset ad requirement
      setTimeout(() => {
        setAdWatchedForCurrent(false);
        checkFreeTurn();
      }, 1000);
    }, 4000);
  };

  const handleAdWatch = () => {
    setIsAdLoading(true);
    setTimeout(() => {
      setIsAdLoading(false);
      setAdWatchedForCurrent(true);
      handleSpin();
    }, 3000);
  };

  const handleFreeSpin = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('last_free_spin_date', today);
    setHasFreeTurn(false);
    setAdWatchedForCurrent(true);
    handleSpin();
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full flex items-center mb-10">
        <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
        <h1 className="text-xl font-gaming font-bold text-white uppercase">Mega Spin</h1>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center mt-10">
        <div className="absolute top-0 z-10 text-4xl text-amber-500 rotate-180">▼</div>
        <div 
          className="w-full h-full rounded-full border-8 border-slate-800 shadow-2xl overflow-hidden transition-transform duration-[4s] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((s, i) => (
            <div key={i} className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center" style={{ backgroundColor: s.color, transform: `rotate(${i * 60}deg) skewY(-30deg)` }}>
              <span className="text-white font-bold text-xs transform skewY(30deg) rotate(30deg) -translate-x-2">🪙{s.value}</span>
            </div>
          ))}
        </div>
        <div className="absolute w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700 flex items-center justify-center font-bold text-white shadow-xl">WIN</div>
      </div>

      <div className="mt-16 w-full max-w-xs space-y-4">
        {hasFreeTurn ? (
          <button onClick={handleFreeSpin} disabled={spinning} className="w-full gradient-gold py-4 rounded-2xl font-bold text-slate-950 shadow-xl active:scale-95">
            {spinning ? 'SPINNING...' : 'FREE SPIN!'}
          </button>
        ) : adWatchedForCurrent ? (
           <button disabled className="w-full bg-slate-800 py-4 rounded-2xl font-bold text-slate-500 shadow-xl">
             {spinning ? 'SPINNING...' : 'WAIT...'}
           </button>
        ) : (
          <button onClick={handleAdWatch} disabled={spinning} className="w-full gradient-purple py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 active:scale-95">
            <span>▶️</span> {spinning ? 'SPINNING...' : 'WATCH AD TO SPIN'}
          </button>
        )}
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Earn up to ₹2.00 per spin</p>
      </div>

      {isAdLoading && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="font-gaming text-sm text-white">AD LOADING...</p>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
