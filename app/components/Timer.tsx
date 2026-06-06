"use client";
import { useState, useEffect, useRef, useMemo } from 'react';

type TimerState = 'idle' | 'ready' | 'running' | 'stopped';

export default function Timer() {
  const [time, setTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [showGuide, setShowGuide] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const [history, setHistory] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rubik-timer-history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }
    }
    return [];
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<TimerState>('idle');
  const modalOpenRef = useRef(false); 
  const startTimeRef = useRef<number>(0);

  const updateState = (newState: TimerState) => {
    stateRef.current = newState;
    setTimerState(newState);
  };

  const toggleGuide = (show: boolean) => {
    setShowGuide(show);
    modalOpenRef.current = show || showClearConfirm;
  };

  const toggleClearConfirm = (show: boolean) => {
    setShowClearConfirm(show);
    modalOpenRef.current = show || showGuide;
  };

  const saveHistory = (newHistory: number[]) => {
    setHistory(newHistory);
    localStorage.setItem('rubik-timer-history', JSON.stringify(newHistory));
  };

  const deleteSolve = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
    setShowClearConfirm(false);
    modalOpenRef.current = showGuide;
  };

  useEffect(() => {
    const isInteractiveElement = (target: EventTarget | null) => {
      if (!target) return false;
      const element = target as HTMLElement;
      return element.tagName === 'BUTTON' || element.closest('button') !== null;
    };

    const handleDown = (e: KeyboardEvent | TouchEvent) => {
      if (modalOpenRef.current) return;
      if (isInteractiveElement(e.target)) return;

      if (e instanceof KeyboardEvent) {
        if (e.code !== 'Space') return;
        if (e.repeat) return;
        e.preventDefault();
      }

      const currentState = stateRef.current;

      if (currentState === 'idle') {
        setTime(0);
        updateState('ready');
      } else if (currentState === 'running') {
        const finalTime = Date.now() - startTimeRef.current;
        setTime(finalTime);
        
        setHistory((prev: number[]) => {
          const newHistory = [finalTime, ...prev];
          localStorage.setItem('rubik-timer-history', JSON.stringify(newHistory));
          return newHistory;
        });

        updateState('stopped');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (currentState === 'stopped') {
        setTime(0);
        updateState('idle'); 
      }
    };

    const handleUp = (e: KeyboardEvent | TouchEvent) => {
      if (modalOpenRef.current) return;
      if (isInteractiveElement(e.target)) return;
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;

      const currentState = stateRef.current;

      if (currentState === 'ready') {
        updateState('running');
        startTimeRef.current = Date.now(); 
        
        timerRef.current = setInterval(() => {
          setTime(Date.now() - startTimeRef.current);
        }, 10);
      }
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('touchstart', handleDown, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    const secStr = seconds.toString().padStart(2, '0');
    const csStr = centiseconds.toString().padStart(2, '0');
    
    return minutes > 0 ? `${minutes}:${secStr}.${csStr}` : `${seconds}.${csStr}`;
  };

  // Tính toán các chỉ số
  const stats = useMemo(() => {
    if (history.length === 0) return { best: 0, mean: 0, ao5: 0 };
    
    const best = Math.min(...history);
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    
    let ao5 = 0;
    if (history.length >= 5) {
      const last5 = history.slice(0, 5);
      const sorted = [...last5].sort((a, b) => a - b);
      // Loại bỏ best và worst của 5 lần gần nhất
      const sum = sorted[1] + sorted[2] + sorted[3];
      ao5 = sum / 3;
    }
    
    return { best, mean, ao5 };
  }, [history]);

  const timerColorClass = 
    timerState === 'ready' ? 'text-emerald-500 scale-105 drop-shadow-md' : 
    timerState === 'running' ? 'text-slate-900 scale-110' : 
    'text-slate-900';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 m-5 max-w-7xl mx-auto">
      <div className="lg:col-span-3 relative flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-md border border-slate-300 animate-in fade-in duration-500 select-none overflow-hidden min-h-[500px]">
        
        <button 
          onClick={() => toggleGuide(true)}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full font-extrabold text-lg transition-colors z-10"
          title="Hướng dẫn sử dụng"
        >
          ?
        </button>

        <h2 className="text-xl text-slate-500 mb-6 uppercase tracking-widest font-extrabold">Rubik Timer</h2>
        
        <div className={`text-7xl md:text-9xl font-mono mb-6 font-bold transition-all duration-200 ${timerColorClass}`}>
          {formatTime(time)}
        </div>

        <p className="text-slate-400 font-medium h-6 text-sm md:text-base animate-in fade-in">
          {timerState === 'stopped' ? 'Nhấn Space / Chạm màn hình để xóa kết quả' : 
           timerState === 'idle' ? 'Nhấn / Chạm giữ để chuẩn bị' : ''}
        </p>

        {showGuide && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Hướng dẫn thao tác</h3>
            <ul className="text-left space-y-5 max-w-md text-slate-600 font-medium text-sm md:text-base">
              <li className="flex gap-3 items-start">
                <span className="text-xl">💻</span>
                <span>
                  <b>Máy tính:</b> Giữ phím <kbd className="bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-slate-800 font-mono shadow-sm mx-1">Space</kbd> để chuẩn bị, thả ra để bắt đầu. Nhấn lần nữa để dừng. Nhấn thêm 1 lần để xóa thời gian.
                </span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-xl">📱</span>
                <span>
                  <b>Điện thoại:</b> Chạm giữ màn hình để chuẩn bị, thả tay để bắt đầu. Chạm lần nữa để dừng. Chạm thêm 1 lần để xóa thời gian.
                </span>
              </li>
            </ul>
            <button 
              onClick={() => toggleGuide(false)}
              className="mt-10 px-8 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-transform active:scale-95"
            >
              Đã hiểu
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Thống kê</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-black font-semibold mb-1">Tốt nhất</div>
              <div className="text-xl font-mono font-bold text-emerald-600">{stats.best > 0 ? formatTime(stats.best) : '--'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-black font-semibold mb-1">Trung bình (Ao5)</div>
              <div className="text-xl font-mono font-bold text-blue-600">{stats.ao5 > 0 ? formatTime(stats.ao5) : '--'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-black font-semibold mb-1">Trung bình tổng</div>
              <div className="text-xl font-mono font-bold text-black">{stats.mean > 0 ? formatTime(stats.mean) : '--'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl flex-1 shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[200px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Lịch sử ({history.length})</h3>
            {history.length > 0 && (
              <button 
                onClick={() => toggleClearConfirm(true)}
                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
              >
                Xóa hết
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[168px] relative">
            {showClearConfirm && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm font-bold text-slate-800 mb-4">Xóa toàn bộ lịch sử?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                  <button 
                    onClick={() => toggleClearConfirm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-slate-300 text-sm italic text-center">
                Chưa có dữ liệu giải đố
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {history.map((t, i) => (
                  <div key={`${i}-${t}`} className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-300 w-4">{history.length - i}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatTime(t)}
                        {t === stats.best && history.length > 1 && (
                          <span className="ml-2 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Best</span>
                        )}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteSolve(i)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                      title="Xóa lần này"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
