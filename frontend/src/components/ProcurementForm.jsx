import { useState } from 'react';
import { PackageOpen, Hash, Search } from 'lucide-react';

export default function ProcurementForm({ onAnalyze, disabled, appState }) {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1000');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onAnalyze({ productName, quantity: Math.max(1, parseInt(quantity) || 1000) });
  };

  const buttonLabel = appState === 'executing' ? 'Executing PO…' : appState === 'analyzing' ? 'Assessing…' : 'Run Gemini LCA';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Name</label>
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

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Quantity</label>
        <div className="relative">
          <Hash className="absolute top-2.5 left-3 w-4 h-4 text-gray-300" />
          <input
            type="number"
            min="1"
            disabled={disabled}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 pl-9 text-sm text-gray-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-40"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !productName.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-100 transition-all"
      >
        <Search className="w-4 h-4" />
        {buttonLabel}
      </button>
    </form>
  );
}
