
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, BattleState, Challenge } from '../types';

interface MinesGameProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (fee: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const MinesGame: React.FC<MinesGameProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const GEM_TARGET = 5;
  const [grid, setGrid] = useState<(string | null)[]>(Array(25).fill(null));
  const [mines, setMines] = useState<number[]>([]);
  const [gemsFound, setGemsFound] = useState(0);
  const [manualFeeInput, setManualFeeInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
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
  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Mines Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      handleJoinBattle(location.state.challengeFee, true);
    }
  }, [location.state]);

  const initMines = () => {
    const newMines: number[] = [];
    while (newMines.length < 5) {
      const pos = Math.floor(Math.random() * 25);
      if (!newMines.includes(pos)) newMines.push(pos);
    }
    setMines(newMines);
    setGrid(Array(25).fill(null));
    setGemsFound(0);
  };

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
          initMines();
          const oppTime = 10 + Math.random() * 8;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime }));
          startTimer();
        }
      }, 2000);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          initMines();
          const oppTime = 10 + Math.random() * 8;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime, entryFee: fee }));
          startTimer();
        }, 6000);
      }
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setBattle(prev => {
        const newTime = prev.userTime + 0.1;
        const oppProg = Math.min(100, (newTime / prev.opponentTime) * 100);
        return { ...prev, userTime: newTime, opponentProgress: oppProg };
      });
    }, 100);
  };

  const handleAcceptChallenge = (c: Challenge) => {
    onRemoveChallenge(c.id);
    handleJoinBattle(c.entry_fee, true);
  };

  const handleTileClick = (index: number) => {
    if (!battle.isBattleActive || battle.isFinished || grid[index] !== null) return;
    if (mines.includes(index)) {
      const newGrid = [...grid];
      mines.forEach(m => newGrid[m] = '💣');
      setGrid(newGrid);
      handleFinish(false);
    } else {
      const newGrid = [...grid];
      newGrid[index] = '💎';
      setGrid(newGrid);
      const newCount = gemsFound + 1;
      setGemsFound(newCount);
      if (newCount >= GEM_TARGET) handleFinish(true);
    }
  };

  const handleFinish = (isSuccess: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const won = isSuccess && battle.userTime < battle.opponentTime;
    const reward = won ? Math.floor(battle.entryFee * 1.8 * 100) : 0;
    setBattle(prev => ({ ...prev, isFinished: true, winner: won ? 'user' : 'opponent' }));
    onRecordBattle('Mines Battle', battle.entryFee, won ? 'Win' : 'Loss', reward);
    if (won) confetti({ particleCount: 150 });
  };

  if (isPublishing) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-gaming text-white uppercase tracking-widest">Waiting in Mines Lobby</h2>
        <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">₹{battle.entryFee} Challenge Published</p>
      </div>
    );
  }

  if (battle.isSearching) return <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center"><div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div><h2 className="text-xl font-gaming text-white uppercase tracking-widest">Entering Mine Field</h2></div>;

  if (!battle.isBattleActive && !battle.isFinished) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase">Mines Lobby</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Open Battles</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No Mines challenges found.</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-slate-700" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-emerald-500 text-[9px] font-bold uppercase">Stake: ₹{c.entry_fee}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcceptChallenge(c)}
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-4 tracking-widest text-center">Challenge Others</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[10, 25, 50, 100].map(fee => (
               <button key={fee} onClick={() => handleJoinBattle(fee)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={manualFeeInput}
              onChange={(e) => setManualFeeInput(e.target.value)}
              placeholder="Amount ₹" 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white text-xs outline-none focus:border-emerald-500" 
            />
            <button 
              onClick={() => handleJoinBattle(parseInt(manualFeeInput))}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase"
            >Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl">
        <div className="text-center text-white"><p className="text-[10px] font-bold uppercase text-slate-500">Timer</p><p className="font-gaming text-lg">{battle.userTime.toFixed(1)}s</p></div>
        <div className="text-center text-white"><p className="text-[10px] font-bold uppercase text-slate-500">Gems</p><p className="font-gaming text-lg text-emerald-400">{gemsFound}/{GEM_TARGET}</p></div>
        <div className="w-20"><div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${battle.opponentProgress}%` }}></div></div></div>
      </div>
      <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] bg-slate-900 p-3 rounded-3xl shadow-2xl">
        {grid.map((tile, i) => (
          <button key={i} onClick={() => handleTileClick(i)} className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${tile === null ? 'bg-slate-800 active:scale-90' : tile === '💎' ? 'border-2 border-emerald-500' : 'border-2 border-red-500'}`}>{tile}</button>
        ))}
      </div>
      {battle.isFinished && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center">
           <h2 className={`text-4xl font-gaming mb-8 ${battle.winner === 'user' ? 'text-emerald-400' : 'text-red-500'}`}>{battle.winner === 'user' ? 'GEM MASTER' : 'DEFEATED'}</h2>
           <button onClick={() => navigate('/')} className="gradient-gold w-full py-5 rounded-2xl font-bold text-slate-950 uppercase">Home</button>
        </div>
      )}
    </div>
  );
};

export default MinesGame;
