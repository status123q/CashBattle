
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, BattleState, Challenge } from '../types';

interface Balloon { id: number; x: number; y: number; color: string; }

interface BalloonPopProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (fee: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const BalloonPop: React.FC<BalloonPopProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const POP_TARGET = 15;
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popped, setPopped] = useState(0);
  const [manualFee, setManualFee] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [battle, setBattle] = useState<BattleState>({
    isSearching: false,
    isBattleActive: false,
    entryFee: 0,
    userTime: 0,
    opponentTime: 0,
    opponentProgress: 0,
    isFinished: false,
    winner: null
  });

  const timerRef = useRef<any>(null);
  const loopsRef = useRef<any[]>([]);
  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Balloon Pop Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      handleJoinBattle(location.state.challengeFee, true);
      setOpponentName(location.state.opponent || 'Popper');
    }
  }, [location.state]);

  const handleJoinBattle = (fee: number, isDirectJoin: boolean = false) => {
    if (isNaN(fee) || fee <= 0) return;
    
    const totalEffectiveRupees = user.deposit_balance + (user.current_coins / 100);
    if (totalEffectiveRupees < fee) {
      alert("Insufficient funds!");
      return;
    }

    if (isDirectJoin) {
      setBattle(prev => ({ ...prev, isSearching: true, entryFee: fee }));
      setTimeout(() => {
        if (onPayFee(fee)) {
          startGameplay();
          const oppTime = 10 + Math.random() * 8;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime }));
          startBattleTimer();
        }
      }, 1500);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          startGameplay();
          const oppTime = 10 + Math.random() * 8;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime, entryFee: fee }));
          startBattleTimer();
        }, 5000);
      }
    }
  };

  const startBattleTimer = () => {
    timerRef.current = setInterval(() => {
      setBattle(prev => {
        const newTime = prev.userTime + 0.1;
        return { ...prev, userTime: newTime, opponentProgress: Math.min(100, (newTime / prev.opponentTime) * 100) };
      });
    }, 100);
  };

  const startGameplay = () => {
    const spawnLoop = setInterval(() => {
      setBalloons(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: 110, color: COLORS[Math.floor(Math.random() * COLORS.length)] }]);
    }, 500);
    const moveLoop = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, y: b.y - 0.7 })).filter(b => b.y > -10));
    }, 20);
    loopsRef.current = [spawnLoop, moveLoop];
  };

  const handleAcceptChallenge = (c: Challenge) => {
    onRemoveChallenge(c.id);
    setOpponentName(c.creator_name);
    handleJoinBattle(c.entry_fee, true);
  };

  const pop = (id: number) => {
    if (!battle.isBattleActive || battle.isFinished) return;
    setBalloons(prev => prev.filter(b => b.id !== id));
    setPopped(prev => {
      const newVal = prev + 1;
      if (newVal >= POP_TARGET) handleFinish();
      return newVal;
    });
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    loopsRef.current.forEach(clearInterval);
    const won = battle.userTime < battle.opponentTime;
    const reward = won ? Math.floor(battle.entryFee * 1.8 * 100) : 0;
    
    setBattle(prev => ({ ...prev, isFinished: true, winner: won ? 'user' : 'opponent' }));
    onRecordBattle('Balloon Pop Battle', battle.entryFee, won ? 'Win' : 'Loss', reward);

    if (won) confetti({ particleCount: 150 });
  };

  if (isPublishing) {
    return (
      <div className="flex-1 bg-sky-500 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-gaming text-white uppercase tracking-widest">Waiting for Popper</h2>
        <p className="text-white/70 text-[10px] mt-2 font-bold uppercase">₹{battle.entryFee} Pop Challenge Live</p>
      </div>
    );
  }

  if (battle.isSearching) return <div className="flex-1 bg-sky-500 flex items-center justify-center font-gaming text-white text-3xl animate-pulse">MATCHING...</div>;

  if (!battle.isBattleActive && !battle.isFinished) {
    return (
      <div className="flex-1 bg-sky-400 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-white text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase">Balloon Lobby</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-4">Live Poppers</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-white/10 border border-dashed border-white/20 p-8 rounded-3xl text-center">
                <p className="text-white/50 text-[10px] font-bold uppercase">No pop challenges available.</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-white/40" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-white/70 text-[9px] font-bold uppercase">Prize: ₹{(c.entry_fee * 1.8).toFixed(1)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcceptChallenge(c)}
                    className="bg-white text-sky-600 px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-white/70 font-bold uppercase mb-4 tracking-widest text-center">Enter the Pop Arena</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[5, 10, 20, 50].map(fee => (
               <button key={fee} onClick={() => handleJoinBattle(fee)} className="bg-white/10 border border-white/20 p-4 rounded-xl text-left">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-white/70 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={manualFee} onChange={(e) => setManualFee(e.target.value)} placeholder="₹" className="flex-1 bg-white/10 rounded-2xl px-4 text-white placeholder:text-white/50 border border-white/20 text-xs" />
            <button onClick={() => handleJoinBattle(parseInt(manualFee))} className="bg-white text-sky-600 px-6 py-3 rounded-xl font-bold text-[10px] uppercase">Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-sky-400 p-6 flex flex-col items-center relative overflow-hidden">
      <div className="w-full flex justify-between items-center z-50 bg-white/20 p-4 rounded-3xl mb-8">
        <div className="text-center text-white"><p className="font-gaming text-lg">{battle.userTime.toFixed(1)}s</p></div>
        <div className="text-center font-gaming text-[10px] text-white uppercase tracking-widest">{opponentName} vs You</div>
        <div className="text-center text-white"><p className="font-gaming text-lg">{popped}/{POP_TARGET}</p></div>
      </div>
      {balloons.map(b => (
        <button key={b.id} onClick={() => pop(b.id)} className="absolute w-16 h-20 shadow-lg" style={{ left: `${b.x}%`, top: `${b.y}%`, backgroundColor: b.color, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' }}></button>
      ))}
      {battle.isFinished && (
        <div className="fixed inset-0 z-[100] bg-sky-600 flex flex-col items-center justify-center p-8">
           <h2 className="text-5xl font-gaming text-white mb-10">{battle.winner === 'user' ? 'VICTORY' : 'LOST'}</h2>
           <button onClick={() => navigate('/')} className="w-full bg-white text-sky-600 py-5 rounded-3xl font-bold">HOME</button>
        </div>
      )}
    </div>
  );
};

export default BalloonPop;
