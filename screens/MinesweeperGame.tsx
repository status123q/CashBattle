
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, BattleState, Challenge } from '../types';

interface MinesweeperProps {
  user: User;
  onWin: (amount: number) => void;
  onPayFee: (fee: number) => boolean;
  onRecordBattle: (gameTitle: string, entryFee: number, outcome: 'Win' | 'Loss' | 'Draw', rewardCoins: number) => void;
  onCreateChallenge: (fee: number) => void;
  onRemoveChallenge: (id: string) => void;
  challenges: Challenge[];
}

const MinesweeperGame: React.FC<MinesweeperProps> = ({ user, onWin, onPayFee, onRecordBattle, onCreateChallenge, onRemoveChallenge, challenges }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const SIZE = 6;
  const MINES_COUNT = 5;
  const [grid, setGrid] = useState<{ isMine: boolean, revealed: boolean, neighbors: number }[]>([]);
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
  const gameSpecificChallenges = challenges.filter(c => c.game_title === 'Minesweeper Battle' && c.creator_id !== user.uid);

  useEffect(() => {
    if (location.state && location.state.challengeFee) {
      handleJoinBattle(location.state.challengeFee, true);
      setOpponentName(location.state.opponent || 'Expert');
    }
  }, [location.state]);

  const initBoard = () => {
    const tempGrid = Array(SIZE * SIZE).fill(null).map(() => ({ isMine: false, revealed: false, neighbors: 0 }));
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const idx = Math.floor(Math.random() * (SIZE * SIZE));
      if (!tempGrid[idx].isMine) {
        tempGrid[idx].isMine = true;
        minesPlaced++;
      }
    }
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (!tempGrid[i].isMine) {
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        let count = 0;
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            const nr = row + r;
            const nc = col + c;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
              if (tempGrid[nr * SIZE + nc].isMine) count++;
            }
          }
        }
        tempGrid[i].neighbors = count;
      }
    }
    setGrid(tempGrid);
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
          initBoard();
          const oppTime = 15 + Math.random() * 10;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime }));
          startTimer();
        }
      }, 1500);
    } else {
      setIsPublishing(true);
      if (onPayFee(fee)) {
        onCreateChallenge(fee);
        setTimeout(() => {
          setIsPublishing(false);
          initBoard();
          const oppTime = 15 + Math.random() * 10;
          setBattle(prev => ({ ...prev, isSearching: false, isBattleActive: true, opponentTime: oppTime, entryFee: fee }));
          startTimer();
        }, 5000);
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
    setOpponentName(c.creator_name);
    handleJoinBattle(c.entry_fee, true);
  };

  const reveal = (idx: number) => {
    if (!battle.isBattleActive || battle.isFinished || grid[idx].revealed) return;
    const newGrid = [...grid];
    newGrid[idx].revealed = true;
    if (newGrid[idx].isMine) {
      handleFinish(false);
      newGrid.forEach(t => { if (t.isMine) t.revealed = true; });
    } else {
      const remainingSafe = newGrid.filter(t => !t.isMine && !t.revealed).length;
      if (remainingSafe === 0) handleFinish(true);
    }
    setGrid(newGrid);
  };

  const handleFinish = (isSuccess: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const won = isSuccess && battle.userTime < battle.opponentTime;
    const reward = won ? Math.floor(battle.entryFee * 1.8 * 100) : 0;
    
    setBattle(prev => ({ ...prev, isFinished: true, winner: won ? 'user' : 'opponent' }));
    onRecordBattle('Minesweeper Battle', battle.entryFee, won ? 'Win' : 'Loss', reward);

    if (won) confetti({ particleCount: 150 });
  };

  if (isPublishing) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-gaming text-white uppercase tracking-widest">In Lobby...</h2>
        <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">₹{battle.entryFee} Challenge Active</p>
      </div>
    );
  }

  if (battle.isSearching) return <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!battle.isBattleActive && !battle.isFinished) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
          <h1 className="text-xl font-gaming font-bold text-white uppercase">Minesweeper Hub</h1>
        </div>
        
        <div className="mb-10">
          <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Open Battles</h2>
          <div className="space-y-3">
            {gameSpecificChallenges.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No one's looking for mines.</p>
              </div>
            ) : (
              gameSpecificChallenges.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.creator_photo} className="w-10 h-10 rounded-full border border-slate-700" alt="o" />
                    <div>
                      <p className="text-white text-[10px] font-bold">{c.creator_name}</p>
                      <p className="text-indigo-400 text-[9px] font-bold uppercase">Stake: ₹{c.entry_fee}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAcceptChallenge(c)}
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-4 tracking-widest text-center">Custom Lobby</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             {[5, 10, 20, 50].map(fee => (
               <button key={fee} onClick={() => handleJoinBattle(fee)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
                  <p className="text-white font-bold text-sm">₹{fee}</p>
                  <p className="text-[8px] text-indigo-500 font-bold uppercase">Win ₹{(fee * 1.8).toFixed(1)}</p>
               </button>
             ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={manualFee} onChange={(e) => setManualFee(e.target.value)} placeholder="₹" className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white text-xs outline-none" />
            <button onClick={() => handleJoinBattle(parseInt(manualFee))} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase">Publish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-2xl">
         <div><p className="font-gaming text-white text-lg">{battle.userTime.toFixed(1)}s</p></div>
         <div className="flex-1 px-6"><div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${battle.opponentProgress}%` }}></div></div></div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {grid.map((tile, i) => (
          <button key={i} onClick={() => reveal(i)} className={`w-12 h-12 rounded flex items-center justify-center font-bold ${tile.revealed ? (tile.isMine ? 'bg-red-500' : 'bg-slate-800 text-blue-400') : 'bg-slate-700'}`}>{tile.revealed ? (tile.isMine ? '💣' : (tile.neighbors || '')) : ''}</button>
        ))}
      </div>
      {battle.isFinished && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8">
           <h2 className={`text-4xl font-gaming mb-8 ${battle.winner === 'user' ? 'text-indigo-400' : 'text-red-500'}`}>{battle.winner === 'user' ? 'VICTORY' : 'DEFEAT'}</h2>
           <button onClick={() => navigate('/')} className="gradient-gold w-full py-5 rounded-2xl font-bold">HOME</button>
        </div>
      )}
    </div>
  );
};

export default MinesweeperGame;
