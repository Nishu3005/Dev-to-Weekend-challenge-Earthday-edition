import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import CombinedWorldScene from './CombinedWorldScene';

export default function EcologicalVisualizer({ appState, analysisResult, executionResult, onExecute }) {
  if (appState === 'idle' || appState === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center h-full">
        <div className="text-5xl mb-4">{appState === 'analyzing' ? '🔬' : '🌿'}</div>
        <p className="text-gray-400 text-sm max-w-xs">
          {appState === 'analyzing'
            ? 'Calling Gemini LCA Engine…'
            : 'Select a product from the left panel to see its real ecological impact.'}
        </p>
      </div>
    );
  }

  const { lcaResult, backboardFlags, originalRequest } = analysisResult;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={originalRequest.productName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {/* 🌍 3D Unified World View */}
        <CombinedWorldScene
          deforestationTrees={lcaResult.deforestationCostTrees}
          waterLiters={lcaResult.waterCostLiters}
          carbonKg={lcaResult.carbonCostKg}
          productName={originalRequest.productName}
        />

        {/* Backboard Warnings */}
        {backboardFlags && backboardFlags.length > 0 && (
          <div className="space-y-2">
            {backboardFlags.map((flag, i) => (
              <div key={i} className="flex gap-2.5 items-start bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2.5 rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                <p className="text-xs">{flag}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sustainable Alternative */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-1">Gemini Alternative</div>
          <div className="text-base font-bold text-emerald-900">{lcaResult.sustainableAlternative}</div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{lcaResult.reasoning}</p>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {appState === 'analyzed' && (
            <motion.button
              key="approve"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={onExecute}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-md shadow-emerald-100 transition-all text-sm"
            >
              <ArrowRightCircle className="w-4 h-4" />
              Approve Sustainable Alternative
            </motion.button>
          )}

          {appState === 'executing' && (
            <div className="w-full text-center py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 animate-pulse">
              Authenticating via Auth0 · Drafting PO…
            </div>
          )}

          {appState === 'executed' && executionResult && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-400 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-gray-800 text-sm">Sustainable PO Approved & Logged to Snowflake</div>
                  <div className="text-xs font-mono text-gray-400 mt-0.5">ID: {executionResult.vaultLogId}</div>
                </div>
              </div>
              {executionResult.savings && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-emerald-200">
                  <div className="text-center bg-white rounded-lg p-2 border border-emerald-100">
                    <div className="text-xs text-amber-600 font-semibold mb-0.5">🌳 Trees Saved</div>
                    <div className="text-sm font-bold text-amber-800">{Math.round(executionResult.savings.trees).toLocaleString()}</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-2 border border-emerald-100">
                    <div className="text-xs text-blue-600 font-semibold mb-0.5">💧 Water Saved</div>
                    <div className="text-sm font-bold text-blue-800">{Math.round(executionResult.savings.water).toLocaleString()} L</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-2 border border-emerald-100">
                    <div className="text-xs text-slate-600 font-semibold mb-0.5">🏭 CO₂ Avoided</div>
                    <div className="text-sm font-bold text-slate-800">{Math.round(executionResult.savings.carbon).toLocaleString()} kg</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
