import { useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, KeyRound, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';

const SPONSORS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    color: '#4285f4',
    badge: 'LCA Brain',
    required: true,
    testable: true,
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy…', secret: true },
    ],
  },
  {
    id: 'backboard',
    name: 'Backboard',
    color: '#7c3aed',
    badge: 'Memory',
    fields: [
      { key: 'apiKey',    label: 'API Key',    placeholder: 'bb_live_…', secret: true },
      { key: 'projectId', label: 'Project ID', placeholder: 'proj_…' },
    ],
  },
  {
    id: 'auth0',
    name: 'Auth0',
    color: '#eb5424',
    badge: 'Execution',
    fields: [
      { key: 'domain',       label: 'Domain',        placeholder: 'your-tenant.us.auth0.com' },
      { key: 'clientId',     label: 'Client ID',     placeholder: 'M2M client ID', secret: true },
      { key: 'clientSecret', label: 'Client Secret', placeholder: '…', secret: true },
      { key: 'audience',     label: 'Audience',      placeholder: 'https://api.your-app.com' },
    ],
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    color: '#29b5e8',
    badge: 'Vault',
    fields: [
      { key: 'account',   label: 'Account',   placeholder: 'abc12345.us-east-1' },
      { key: 'username',  label: 'Username',  placeholder: 'GREENGATE_USER' },
      { key: 'password',  label: 'Password',  placeholder: '…', secret: true },
      { key: 'warehouse', label: 'Warehouse', placeholder: 'COMPUTE_WH' },
    ],
  },
];

// Status: null | 'testing' | 'ok' | 'fail'
export default function ApiKeysPanel({ keys, onChange }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({ gemini: true });
  const [geminiStatus, setGeminiStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'
  const [geminiError, setGeminiError] = useState('');

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const set = (sponsorId, fieldKey, val) => {
    onChange({ ...keys, [sponsorId]: { ...(keys[sponsorId] || {}), [fieldKey]: val } });
    // Reset test status when key changes
    if (sponsorId === 'gemini') { setGeminiStatus(null); setGeminiError(''); }
  };

  const testGemini = async () => {
    const key = keys.gemini?.apiKey?.trim();
    if (!key) return;
    setGeminiStatus('testing');
    setGeminiError('');
    try {
      const { data } = await axios.post('http://localhost:3001/api/test-gemini', { apiKey: key });
      setGeminiStatus(data.valid ? 'ok' : 'fail');
      if (!data.valid) setGeminiError(data.error || 'Key rejected by Gemini');
    } catch {
      setGeminiStatus('fail');
      setGeminiError('Backend unreachable — is the server running?');
    }
  };

  const geminiKey = keys.gemini?.apiKey?.trim();
  const filledCount = SPONSORS.filter(s => s.fields.some(f => keys[s.id]?.[f.key]?.trim())).length;

  return (
    <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-gray-600">API Keys & Credentials</span>
          {geminiStatus === 'ok' && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" /> Gemini live
            </span>
          )}
          {filledCount > 0 && geminiStatus !== 'ok' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {filledCount}/{SPONSORS.length} filled
            </span>
          )}
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {SPONSORS.map(sponsor => {
            const isExpanded = expanded[sponsor.id];
            const filled = sponsor.fields.some(f => keys[sponsor.id]?.[f.key]?.trim());
            const isGemini = sponsor.id === 'gemini';

            return (
              <div key={sponsor.id} className={`border rounded-xl overflow-hidden transition-colors ${
                isGemini && geminiStatus === 'ok' ? 'border-emerald-300' :
                isGemini && geminiStatus === 'fail' ? 'border-red-200' : 'border-gray-100'
              }`}>
                <button
                  onClick={() => toggle(sponsor.id)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* Status dot */}
                    {isGemini && geminiStatus === 'ok'   && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {isGemini && geminiStatus === 'fail' && <XCircle      className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    {isGemini && geminiStatus === 'testing' && <Loader2   className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 animate-spin" />}
                    {(!isGemini || geminiStatus === null) && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: filled ? '#22c55e' : '#d1d5db' }} />
                    )}
                    <span className="text-xs font-semibold text-gray-700">{sponsor.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: sponsor.color + '18', color: sponsor.color }}>
                      {sponsor.badge}
                    </span>
                    {sponsor.required && !filled && (
                      <span className="text-[9px] font-bold text-amber-500 uppercase">required</span>
                    )}
                    {filled && !isGemini && (
                      <span className="text-[9px] font-bold text-emerald-600">✓ saved</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5 bg-gray-50/50">
                    {sponsor.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-medium text-gray-400 mb-0.5">
                          {field.label}
                        </label>
                        <input
                          type={field.secret ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={keys[sponsor.id]?.[field.key] || ''}
                          onChange={e => set(sponsor.id, field.key, e.target.value)}
                          className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 font-mono transition-all ${
                            isGemini && geminiStatus === 'ok'   ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100' :
                            isGemini && geminiStatus === 'fail' ? 'border-red-300 focus:border-red-400 focus:ring-red-100' :
                            'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                          }`}
                        />
                      </div>
                    ))}

                    {/* Gemini: test button + status message */}
                    {isGemini && (
                      <div className="mt-1 flex flex-col gap-1.5">
                        <button
                          onClick={testGemini}
                          disabled={!geminiKey || geminiStatus === 'testing'}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          {geminiStatus === 'testing'
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Testing…</>
                            : <><Zap className="w-3 h-3" /> Test connection</>}
                        </button>

                        {geminiStatus === 'ok' && (
                          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-emerald-700">Connected — key is valid and will be used for all LCA calls</span>
                          </div>
                        )}
                        {geminiStatus === 'fail' && (
                          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-red-50 border border-red-200">
                            <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-[11px] text-red-600">{geminiError || 'Key invalid — check and retry'}</span>
                          </div>
                        )}
                        {geminiStatus === null && geminiKey && (
                          <p className="text-[10px] text-amber-600 px-1">
                            Key entered but not yet verified — click Test to confirm it works.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-[10px] text-gray-400 px-1 mt-0.5">
            Keys are sent only to your local backend and never stored.
          </p>
        </div>
      )}
    </div>
  );
}
