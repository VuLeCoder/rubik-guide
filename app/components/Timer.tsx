"use client";
import { useState, useEffect, useRef } from 'react';

// Bổ sung thêm trạng thái 'stopped' để chặn người dùng bắt đầu lại ngay lập tức
type TimerState = 'idle' | 'ready' | 'running' | 'stopped';

export default function Timer() {
  const [time, setTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [showGuide, setShowGuide] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<TimerState>('idle');
  const guideRef = useRef(false); // Dùng ref để check trạng thái popup bên trong event listener

  const updateState = (newState: TimerState) => {
    stateRef.current = newState;
    setTimerState(newState);
  };

  const toggleGuide = (show: boolean) => {
    setShowGuide(show);
    guideRef.current = show;
  };

  useEffect(() => {
    const isInteractiveElement = (target: EventTarget | null) => {
      if (!target) return false;
      const element = target as HTMLElement;
      // Tránh kích hoạt đếm giờ nếu đang bấm vào nút bấm hoặc nằm trong vùng popup
      return element.tagName === 'BUTTON' || element.closest('button') !== null;
    };

    const handleDown = (e: KeyboardEvent | TouchEvent) => {
      // Vô hiệu hóa phím Space và cảm ứng nếu popup hướng dẫn đang mở
      if (guideRef.current) return;
      if (isInteractiveElement(e.target)) return;

      if (e instanceof KeyboardEvent) {
        if (e.code !== 'Space') return;
        if (e.repeat) return;
        e.preventDefault();
      }

      const currentState = stateRef.current;

      if (currentState === 'idle') {
        // 1. Đang ở trạng thái chờ (0.00) -> Giữ phím để chuyển sang Sẵn sàng
        setTime(0);
        updateState('ready');
      } else if (currentState === 'running') {
        // 2. Đang chạy -> Nhấn/Chạm để Dừng.
        updateState('stopped');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (currentState === 'stopped') {
        // 3. Đang hiện kết quả -> Nhấn/Chạm để Xóa kết quả về 0.00
        setTime(0);
        updateState('idle'); 
      }
    };

    const handleUp = (e: KeyboardEvent | TouchEvent) => {
      if (guideRef.current) return;
      if (isInteractiveElement(e.target)) return;
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;

      const currentState = stateRef.current;

      if (currentState === 'ready') {
        // Thả phím ra khi đang "Sẵn sàng" -> Bắt đầu đếm giờ
        updateState('running');
        const startTime = Date.now(); 
        
        timerRef.current = setInterval(() => {
          setTime(Date.now() - startTime);
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

  const timerColorClass = 
    timerState === 'ready' ? 'text-emerald-500 scale-105 drop-shadow-md' : 
    timerState === 'running' ? 'text-slate-900 scale-110' : 
    'text-slate-900';

  return (
    <div className="relative flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-md border border-slate-300 animate-in fade-in duration-500 select-none overflow-hidden min-h-[400px]">
      
      {/* Nút Help (?) góc trên bên phải */}
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

      {/* Chữ gợi ý thao tác nhỏ ở dưới thay thế cho nút reset cũ */}
      <p className="text-slate-400 font-medium h-6 text-sm md:text-base animate-in fade-in">
        {timerState === 'stopped' ? 'Nhấn Space / Chạm màn hình để xóa kết quả' : 
         timerState === 'idle' ? 'Nhấn / Chạm giữ để chuẩn bị' : ''}
      </p>

      {/* Modal Hướng dẫn */}
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
  );
}
