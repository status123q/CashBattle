
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface DepositProps {
  user: User;
  onDeposit: (amount: number) => void;
}

const Deposit: React.FC<DepositProps> = ({ user, onDeposit }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(10);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleDeposit = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      onDeposit(amount);
      const trans = JSON.parse(localStorage.getItem('transactions') || '[]');
      trans.unshift({
        id: 'DEP_' + Date.now(),
        user_id: user.uid,
        type: 'Deposit',
        amount: amount,
        timestamp: Date.now(),
        description: `Deposited ₹${amount} to wallet`
      });
      localStorage.setItem('transactions', JSON.stringify(trans));
      setTimeout(() => navigate('/'), 1500);
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg shadow-emerald-500/20">✅</div>
        <h2 className="text-2xl font-gaming text-white mb-2">DEPOSIT SUCCESSFUL</h2>
        <p className="text-slate-400">₹{amount} added to your wallet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/')} className="text-slate-400 text-2xl mr-4">←</button>
        <h1 className="text-xl font-gaming font-bold text-white uppercase">Deposit Money</h1>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 mb-8 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">Select Amount</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[10, 50, 100, 500].map(val => (
            <button key={val} onClick={() => setAmount(val)} className={`py-4 rounded-2xl font-gaming font-bold transition-all ${amount === val ? 'bg-amber-500 text-slate-950 scale-105 shadow-xl' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
              ₹{val}
            </button>
          ))}
        </div>
        
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-8">
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            className="bg-transparent w-full text-center text-3xl font-gaming text-amber-500 outline-none"
            placeholder="Custom"
          />
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Enter Manual Amount</p>
        </div>

        <button 
          onClick={handleDeposit}
          disabled={status === 'processing'}
          className="w-full gradient-purple py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {status === 'processing' ? 'SECURE PAY...' : 'PROCEED TO PAY'}
        </button>
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 text-slate-600 bg-slate-900/30 p-4 rounded-2xl border border-slate-900">
          <span className="text-2xl">🛡️</span>
          <p className="text-[10px] font-bold uppercase tracking-widest">Secure 128-bit Encrypted Payments</p>
        </div>
        <p className="text-center text-[8px] text-slate-700 uppercase font-bold tracking-[0.2em]">Partnered with Razorpay & UPI</p>
      </div>
    </div>
  );
};

export default Deposit;
