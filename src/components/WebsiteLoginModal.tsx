import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, Bot, ArrowRight, Lock, Sparkles } from 'lucide-react';

interface WebsiteLoginModalProps {
  onLogin: (username: string) => void;
}

export const WebsiteLoginModal: React.FC<WebsiteLoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('FF_Commander');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your operator username.');
      return;
    }
    // Website login success
    onLogin(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0d1422] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/20 via-[#141f33] to-[#0d1422] border-b border-[#212e47] text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 mb-3">
            <Bot className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold font-gaming text-white tracking-wider">
            FREE FIRE BOT CONTROL PORTAL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Step 1: Authenticate operator session to access 🤖 Bot
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-gaming font-bold text-slate-300 uppercase mb-1.5">
              Operator Username / ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator name"
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-[#1d273a] focus:border-amber-400 rounded-xl text-xs font-gaming text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-gaming font-bold text-slate-300 uppercase mb-1.5">
              Portal Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Portal Passcode"
                className="w-full pl-10 pr-4 py-2.5 bg-[#070b13] border border-[#1d273a] focus:border-amber-400 rounded-xl text-xs font-mono-code text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-gaming font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>LOG IN TO WEBSITE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Next step: Authenticate your Free Fire Account to unlock the bot.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
