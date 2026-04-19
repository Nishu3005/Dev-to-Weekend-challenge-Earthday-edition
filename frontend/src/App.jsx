import { useState } from 'react';
import axios from 'axios';
import { PRESET_PRODUCTS } from './data/presetProducts';
import ProcurementForm from './components/ProcurementForm';
import EcologicalVisualizer from './components/EcologicalVisualizer';

const API_BASE = 'http://localhost:3001/api/procurement';

export default function App() {
  const [appState, setAppState] = useState('analyzed');
  const [analysisResult, setAnalysisResult] = useState(PRESET_PRODUCTS[0]);
  const [executionResult, setExecutionResult] = useState(null);
  const [activePresetId, setActivePresetId] = useState(PRESET_PRODUCTS[0].id);

  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setAnalysisResult(preset);
    setExecutionResult(null);
    setAppState('analyzed');
  };

  const handleAnalyze = async (formData) => {
    setAppState('analyzing');
    setExecutionResult(null);
    setActivePresetId(null);
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, formData);
      setAnalysisResult(data);
      setAppState('analyzed');
    } catch {
      setAppState('idle');
    }
  };

  const handleExecute = async () => {
    setAppState('executing');
    try {
      const { data } = await axios.post(`${API_BASE}/execute`, {
        originalRequest: analysisResult.originalRequest,
        lcaResult: analysisResult.lcaResult,
      });
      setExecutionResult(data);
      setAppState('executed');
    } catch {
      setAppState('analyzed');
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)' }}
    >
      {/* Header */}
      <header className="max-w-[1400px] mx-auto mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg shadow-md shadow-emerald-100">
          🌿
        </div>
        <div>
          <h1 className="text-lg font-bold text-emerald-800 leading-none">GreenGate</h1>
          <p className="text-xs text-gray-400 mt-0.5">Procurement Guardian · Earth Day 2025</p>
        </div>
      </header>

      {/* Layout: 28% left / 72% right */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

        {/* ─── LEFT PANEL ─── */}
        <div className="flex flex-col gap-4">
          {/* New Request */}
          <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">New Request</h2>
            <ProcurementForm
              onAnalyze={handleAnalyze}
              disabled={appState === 'analyzing' || appState === 'executing'}
            />
          </div>

          {/* Pre-Assessed Orders */}
          <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl p-5 shadow-sm flex-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pre-Assessed Orders</h2>
            <div className="space-y-1 overflow-y-auto max-h-[480px] scrollbar-thin pr-1">
              {PRESET_PRODUCTS.map((p) => {
                const isActive = activePresetId === p.id;
                const hasFlag = p.backboardFlags?.length > 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 border ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 leading-snug">{p.originalRequest.productName}</span>
                      {hasFlag && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-emerald-500 mt-0.5 truncate">{p.lcaResult.sustainableAlternative}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl shadow-sm overflow-y-auto max-h-[90vh] scrollbar-thin">
          <div className="p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Ecological Impact</h2>
            <EcologicalVisualizer
              appState={appState}
              analysisResult={analysisResult}
              executionResult={executionResult}
              onExecute={handleExecute}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
