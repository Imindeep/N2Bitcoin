/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { 
  Activity, 
  Cpu, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Database, 
  Zap, 
  Banknote,
  LayoutDashboard,
  Settings,
  History,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface PriceData {
  price: number;
  change24h: number;
}

interface MiningSession {
  id: string;
  timestamp: number;
  btcEarned: number;
  hashrate: number;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

// --- Mock Data & Constants ---

const INITIAL_HASHRATE = 145.4; // TH/s
const BTC_PER_TH_DAY = 0.00000052; // Realistic simulation factor
const UPDATE_INTERVAL = 2000; // 2 seconds update

export default function App() {
  const [btcPrice, setBtcPrice] = useState<PriceData>({ price: 65432.10, change24h: 2.45 });
  const [balance, setBalance] = useState(0.00427812);
  const [fiatBalance, setFiatBalance] = useState(250.45);
  const [hashrate, setHashrate] = useState(INITIAL_HASHRATE);
  const [isMining, setIsMining] = useState(true);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [logs, setLogs] = useState<{ id: string; msg: string; time: string; type: 'info' | 'success' | 'warn' }[]>([
    { id: '1', msg: 'System initialized. Node 082 connected.', time: '04:00:01', type: 'info' },
    { id: '2', msg: 'ASIC array responding. Hashrate stable.', time: '04:00:05', type: 'success' },
  ]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), msg, time: format(new Date(), 'HH:mm:ss'), type }, ...prev].slice(0, 5));
  };

  // Simulation: Add BTC over time
  useEffect(() => {
    if (!isMining) {
      addLog('Mining sequence paused by user', 'warn');
      return;
    }
    
    addLog('Mining heartbeat: Blocks verified', 'info');

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdate) / 1000;
      const days = elapsedSeconds / (24 * 3600);
      const earned = hashrate * BTC_PER_TH_DAY * days;
      
      setBalance(prev => prev + earned);
      setLastUpdate(now);

      // Update history for chart
      setHistory(prev => {
        const next = [...prev, { 
          time: format(now, 'HH:mm:ss'), 
          value: parseFloat((earned * 1000000).toFixed(4)) // Display in sats or scaled
        }].slice(-20);
        return next;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isMining, hashrate, lastUpdate]);

  // Fetch real price (Simulation of real API)
  useEffect(() => {
    const fetchPrice = async () => {
      // In a real app, we'd fetch from CoinGecko: 
      // https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true
      try {
        const mockVolatility = (Math.random() - 0.5) * 50;
        setBtcPrice(prev => ({
          price: prev.price + mockVolatility,
          change24h: prev.change24h + (Math.random() - 0.5) * 0.1
        }));
      } catch (e) {
        console.error("Price fetch error", e);
      }
    };

    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalValueUsd = useMemo(() => balance * btcPrice.price, [balance, btcPrice.price]);

  const handleConvert = () => {
    if (balance <= 0) return;
    const value = balance * btcPrice.price;
    setFiatBalance(prev => prev + value);
    setBalance(0);
    addLog(`Automated Conversion: ${balance.toFixed(8)} BTC -> $${value.toFixed(2)} USD`, 'success');
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#050505]">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a] z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Database className="text-black w-4 h-4" />
          </div>
          <span className="font-serif italic text-xl tracking-wide">BitStratum</span>
        </div>
        <div className="flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/50">
          <button onClick={() => setIsMining(!isMining)} className={cn("transition-colors", isMining ? "text-amber-500" : "hover:text-white")}>
            {isMining ? 'Mining Active' : 'Mining Paused'}
          </button>
          <a href="#" className="hover:text-white transition-colors">Nodes</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <div className="pl-4 border-l border-white/20">
            <span className={cn("transition-colors", isMining ? "text-emerald-400" : "text-red-400")}>
              ● {isMining ? 'Network Sync' : 'Offline'}
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Mining Monitor */}
        <div className="w-3/5 p-8 border-r border-white/5 flex flex-col justify-between overflow-y-auto">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-2">Uptime: 24/7 Perpetual Operation</p>
            <h1 className="text-7xl font-serif font-light mb-12 leading-tight">
              Mining <span className="italic">Engine</span>
            </h1>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-[#0f0f0f] border border-white/10 rounded-lg group">
                <p className="text-[10px] text-white/40 uppercase mb-4 tracking-widest flex justify-between">
                  <span>Hashrate Performance</span>
                  <span className="text-amber-500 font-mono">STABLE</span>
                </p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-light text-white">{hashrate.toFixed(1)}</span>
                  <span className="text-white/40 font-mono uppercase text-xs">TH/s</span>
                </div>
                <div className="mt-6 h-1 bg-white/5 w-full rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(hashrate / 200) * 100}%` }}
                    className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                  />
                </div>
              </div>
              
              <div className="p-6 bg-[#0f0f0f] border border-white/10 rounded-lg">
                <p className="text-[10px] text-white/40 uppercase mb-4 tracking-widest">Worker Health</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-light text-white">99.98</span>
                  <span className="text-white/40 font-mono text-xs">%</span>
                </div>
                <div className="mt-6 flex space-x-1">
                  <div className="flex-1 h-1 bg-emerald-500"></div>
                  <div className="flex-1 h-1 bg-emerald-500"></div>
                  <div className="flex-1 h-1 bg-emerald-500/50 animate-pulse"></div>
                  <div className="flex-1 h-1 bg-white/10"></div>
                </div>
              </div>
            </div>

            {/* Live Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 h-64 relative group overflow-hidden">
              <div className="absolute top-4 left-6 z-10">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Live Signal Output
                </p>
              </div>
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                      itemStyle={{ color: '#f59e0b' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" strokeWidth={1.5} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="mt-8 border-t border-white/5 pt-6">
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/20 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
              Event Stream Output
            </div>
            <div className="space-y-1.5 h-20 overflow-hidden font-mono text-[10px]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
                  <span className="text-white/20">{log.time}</span>
                  <span className="text-white/40">[{log.type.toUpperCase()}]</span>
                  <span className="text-white/60">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Fiat Conversion & Bank Transfer */}
        <div className="w-2/5 bg-[#080808] p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-12">
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.4em] text-amber-500/80 mb-6 font-semibold flex items-center justify-between">
                Protocol Value
                <RefreshCw className={cn("w-3 h-3 transition-transform duration-1000", isMining && "animate-spin-slow")} />
              </h2>
              <div className="space-y-6">
                <div className="pb-6 border-b border-white/10 group cursor-default">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Unliquidated Assets</p>
                  <p className="text-3xl font-light group-hover:text-amber-500 transition-colors font-mono">{balance.toFixed(8)} BTC</p>
                </div>
                
                <div className="flex justify-between items-end border-b border-white/10 pb-6 group cursor-default">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Pending Fiat Conversion</p>
                    <p className="text-3xl font-light">${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="px-3 py-1 bg-amber-500 text-black text-[9px] font-bold tracking-tighter uppercase rounded-full mb-1 italic">
                    {isMining ? 'Syncing' : 'Paused'}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.4em] text-white/40 mb-6">Destination Bank</h2>
              <div className="flex items-center space-x-4 p-5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                  <Banknote className="w-4 h-4 text-white/60 group-hover:text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Chase Private Client</p>
                  <p className="text-[10px] text-white/40 font-mono tracking-wider">Account ending in ••8842</p>
                </div>
                <ExternalLink className="w-3 h-3 text-white/20" />
              </div>
            </section>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.4em] text-white/40 mb-4">Account Overview</h2>
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 tracking-wider">Fiat Balance</span>
                  <span className="font-mono text-sm">${fiatBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 tracking-wider">Target Arrival</span>
                  <span>Today, 11:45 PM EST</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 tracking-wider">Est. Fee (Fixed)</span>
                  <span className="text-amber-500 font-mono">$0.00</span>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-8 space-y-4">
            <button 
              onClick={handleConvert}
              disabled={balance === 0}
              className="w-full bg-white text-black py-5 font-serif italic text-lg hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-[0.98] transform"
            >
              Liquidate Now
            </button>
            <p className="text-center text-[10px] text-white/20 tracking-[0.3em] uppercase font-mono">
              Powered by Tier-1 Secure Protocols
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-12 border-t border-white/5 bg-[#050505] flex items-center justify-between px-8 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", isMining ? "bg-emerald-500" : "bg-red-500")}></div>
            <span className="text-[9px] uppercase tracking-widest text-white/40">Syncing Block 824,192</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[9px] uppercase tracking-widest text-white/40">Node Latency: 12ms</span>
          </div>
          <div className="flex items-center space-x-2 border-l border-white/10 pl-6 ml-6">
            <p className="text-[9px] uppercase tracking-widest text-white/40">BTC Price:</p>
            <span className="text-[9px] font-mono text-white/80">${btcPrice.price.toLocaleString()}</span>
            <span className={cn("text-[8px] font-mono", btcPrice.change24h >= 0 ? "text-emerald-500" : "text-red-500")}>
              {btcPrice.change24h >= 0 ? '+' : ''}{btcPrice.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-[10px] text-white/20 font-mono tracking-tighter">
          SESSION_TOKEN: XF-0912-KB8-VAL
        </div>
      </footer>

      {/* Background Subtle Gradient */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-amber-500/5 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-emerald-500/[0.02] blur-[120px] pointer-events-none -z-10 rounded-full" />
    </div>
  );
}

// --- Internal Components ---

function NavItem({ icon, active = false }: { icon: ReactNode, active?: boolean }) {
  return (
    <button className={cn(
      "w-12 h-12 flex items-center justify-center rounded-xl transition-all relative group",
      active ? "text-orange-500 bg-orange-500/10" : "hover:text-white/80 hover:bg-white/5"
    )}>
      {icon}
      {active && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
      {!active && <div className="absolute left-16 bg-[#1A1A1A] px-2 py-1 rounded text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Label</div>}
    </button>
  );
}

function StatCard({ label, value, subValue, icon, progress }: { label: string, value: string, subValue: string, icon: ReactNode, progress?: number }) {
  return (
    <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">{label}</p>
          <p className="text-2xl font-medium tracking-tight whitespace-nowrap">{value}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-serif italic text-white/30">{subValue}</p>
      </div>
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
          />
        </div>
      )}
    </div>
  );
}
