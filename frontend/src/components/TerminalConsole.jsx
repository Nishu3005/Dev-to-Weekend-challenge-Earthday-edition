import { Loader2 } from 'lucide-react';

export default function TerminalConsole({ logs, isLoading }) {
  return (
    <div className="flex-1 flex flex-col font-mono text-sm">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">SYSTEM IDLE. AWAITING WORKFLOW TRIGGERS.</div>
        ) : (
          logs.map((log, i) => (
             <div key={i} className="flex gap-3">
               <span className="text-slate-500">[{log.time}]</span>
               <span className={log.text.includes('WARNING') || log.text.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}>
                  {log.text}
               </span>
             </div>
          ))
        )}
        
        {isLoading && (
           <div className="flex gap-3 mt-4 text-emerald-600 items-center">
             <Loader2 className="w-4 h-4 animate-spin" />
             <span className="animate-pulse">Awaiting external API response...</span>
           </div>
        )}
      </div>
    </div>
  );
}
