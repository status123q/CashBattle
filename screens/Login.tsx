
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

type LoginView = 'methods' | 'phone' | 'otp';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<LoginView>('methods');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        uid: 'google_' + Math.random().toString(36).substr(2, 9),
        name: 'Gamer ' + Math.floor(Math.random() * 9000),
        email: 'gamer@gmail.com',
        photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
        current_coins: 100, // Welcome bonus
        deposit_balance: 0,
        total_earned_coins: 100,
        created_at: Date.now()
      };
      setIsLoading(false);
      onLogin(mockUser);
    }, 1500);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setView('otp');
    }, 1200);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Please enter the 4-digit OTP");
      return;
    }
    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      const mockUser: User = {
        uid: 'mobile_' + phone,
        name: 'Player ' + phone.slice(-4),
        email: `${phone}@cashbattle.com`,
        phone_number: phone,
        photo_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + phone,
        current_coins: 100, // Welcome bonus
        deposit_balance: 0,
        total_earned_coins: 100,
        created_at: Date.now()
      };
      setIsLoading(false);
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-0 -left-10 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full"></div>

      {/* Logo Section */}
      <div className={`text-center z-10 transition-all duration-500 ${view !== 'methods' ? 'mb-8' : 'mb-16'}`}>
        <div className="w-20 h-20 gradient-purple rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl mb-6 border-2 border-purple-400 rotate-6 transform hover:rotate-0 transition-transform cursor-pointer">
          <span className="text-4xl font-gaming text-amber-400">₹</span>
        </div>
        <h1 className="text-4xl font-gaming font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-amber-400 mb-2">
          CASHBATTLE
        </h1>
        <p className="text-slate-500 font-medium tracking-[0.3em] text-[8px] uppercase font-gaming">The Ultimate Pro Arena</p>
      </div>

      <div className="w-full max-w-sm z-10">
        {isLoading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
              {view === 'otp' ? 'Verifying Identity...' : 'Connecting to Server...'}
            </p>
          </div>
        ) : (
          <>
            {view === 'methods' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <button
                  onClick={simulateGoogleLogin}
                  className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 group"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-600">
                    <span className="bg-slate-950 px-3">or use mobile</span>
                  </div>
                </div>

                <button
                  onClick={() => setView('phone')}
                  className="w-full flex items-center justify-center gap-4 bg-slate-900 border border-slate-800 text-white font-bold py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  <span className="text-xl">📱</span>
                  Mobile Number OTP
                </button>

                <p className="text-center text-[10px] text-slate-600 mt-6 px-4">
                  By continuing, you agree to our <span className="text-slate-400 underline">Terms of Service</span> and <span className="text-slate-400 underline">Privacy Policy</span>.
                </p>
              </div>
            )}

            {view === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-2">
                  <h3 className="text-white font-bold text-lg">Enter Mobile Number</h3>
                  <p className="text-slate-500 text-xs">A 4-digit OTP will be sent for verification</p>
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="70000 00000"
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-4 pl-14 pr-4 text-white text-lg font-bold outline-none focus:border-purple-500 transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full gradient-purple py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-900/20 active:scale-95 transition-transform"
                  >
                    GET OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('methods')}
                    className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-300 py-2"
                  >
                    ← Back to Methods
                  </button>
                </div>
              </form>
            )}

            {view === 'otp' && (
              <form onSubmit={handleOtpVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-2">
                  <h3 className="text-white font-bold text-lg">Verify OTP</h3>
                  <p className="text-slate-500 text-xs">Sent to +91 {phone.slice(0,5)} {phone.slice(5)}</p>
                </div>

                <input
                  type="tel"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0"
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-4 text-center text-3xl font-gaming tracking-[0.5em] text-amber-400 outline-none focus:border-amber-500 transition-all placeholder:text-slate-800"
                  autoFocus
                />

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full gradient-gold py-4 rounded-2xl font-bold text-slate-950 shadow-xl active:scale-95 transition-transform"
                  >
                    VERIFY & SIGN UP
                  </button>
                  <div className="flex justify-between items-center px-2">
                    <button
                      type="button"
                      onClick={() => setView('phone')}
                      className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter hover:text-slate-300"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      className="text-purple-400 font-bold text-[10px] uppercase tracking-tighter"
                      onClick={() => alert("OTP Resent!")}
                    >
                      Resend OTP in 24s
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-30 group">
        <div className="flex items-center gap-2 text-slate-500 text-[8px] uppercase tracking-[0.4em] font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Secure Anti-Cheat Server
        </div>
      </div>
    </div>
  );
};

export default Login;
