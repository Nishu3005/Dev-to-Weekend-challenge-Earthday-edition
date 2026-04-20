import { useState } from 'react';
import axios from 'axios';
import { PRESET_PRODUCTS } from './data/presetProducts';
import ProcurementForm from './components/ProcurementForm';
import EcologicalVisualizer from './components/EcologicalVisualizer';
import ApiKeysPanel from './components/ApiKeysPanel';

const API_BASE = 'http://localhost:3001/api/procurement';

const CHIP_LABELS = {
  'preset-1': 'Plastic Cups',
  'preset-2': 'Styrofoam Peanuts',
  'preset-3': 'Plastic Pens',
  'preset-4': 'Water Bottles',
  'preset-5': 'Light Bulbs',
  'preset-6': 'Printer Paper',
  'preset-7': 'Plastic Cutlery',
};

export default function App() {
  const [appState, setAppState] = useState('analyzed');
  const [analysisResult, setAnalysisResult] = useState(PRESET_PRODUCTS[0]);
  const [executionResult, setExecutionResult] = useState(null);
  const [activePresetId, setActivePresetId] = useState(PRESET_PRODUCTS[0].id);
  const [errorMsg, setErrorMsg] = useState(null);
  const [apiKeys, setApiKeys] = useState({});

  const clearError = () => setErrorMsg(null);

  const handleSelectPreset = (preset) => {
    clearError();
    setActivePresetId(preset.id);
    setAnalysisResult(preset);
    setExecutionResult(null);
    setAppState('analyzed');
  };

  const handleAnalyze = async (formData) => {
    clearError();
    setAppState('analyzing');
    setExecutionResult(null);
    // Don't reset activePresetId or analysisResult yet — only overwrite on success
    try {
      const { data } = await axios.post(`${API_BASE}/analyze`, { ...formData, apiKeys });
      setAnalysisResult(data);
      setActivePresetId(null);
      setAppState('analyzed');
    } catch {
      setErrorMsg('LCA analysis failed — the backend may be offline. Try a preset below.');
      setAppState(analysisResult ? 'analyzed' : 'idle');
    }
  };

  const handleExecute = async () => {
    clearError();
    setAppState('executing');
    try {
      const { data } = await axios.post(`${API_BASE}/execute`, {
        originalRequest: analysisResult.originalRequest,
        lcaResult: analysisResult.lcaResult,
        apiKeys,
      });
      setExecutionResult(data);
      setAppState('executed');
    } catch {
      setErrorMsg('Failed to approve order — please try again.');
      setAppState('analyzed');
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">

        {/* ─── LEFT PANEL ─── */}
        <div className="flex flex-col gap-4">

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span className="flex-1">{errorMsg}</span>
              <button onClick={clearError} className="shrink-0 text-red-400 hover:text-red-600 font-bold">✕</button>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <ProcurementForm
              onAnalyze={handleAnalyze}
              appState={appState}
              disabled={appState === 'analyzing' || appState === 'executing'}
            />
          </div>

          {/* API Keys & Credentials */}
          <ApiKeysPanel keys={apiKeys} onChange={setApiKeys} />

          {/* Quick-select keyword chips */}
          <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PRODUCTS.map((p) => {
                const isActive = activePresetId === p.id;
                const hasFlag = p.backboardFlags?.length > 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                    }`}
                  >
                    {hasFlag && <span className="text-orange-400">⚠</span>}
                    {CHIP_LABELS[p.id]}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl shadow-sm overflow-y-auto max-h-[calc(100vh-3rem)]">
          <div className="p-6">
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
