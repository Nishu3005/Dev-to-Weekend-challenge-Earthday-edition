import { useState } from 'react';
import { PackageOpen, Search } from 'lucide-react';

export default function ProcurementForm({ onAnalyze, disabled }) {
  const [productName, setProductName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) return;
    // Pass defaults for quantity/budget — backend handles them
    onAnalyze({ productName, quantity: 1000, currentBudget: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name</label>
        <div className="relative">
          <PackageOpen className="absolute top-2.5 left-3 w-4 h-4 text-gray-300" />
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="e.g. Polystyrene Packaging"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 pl-9 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-40"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !productName.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-100 transition-all"
      >
        <Search className="w-4 h-4" />
        {disabled ? 'Assessing…' : 'Run Gemini LCA'}
      </button>
    </form>
  );
}
