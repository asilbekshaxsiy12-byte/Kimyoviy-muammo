
import React, { useState, useRef } from 'react';
import { solveChemistryProblem } from '../services/geminiService';

const ProblemSolver: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!input && !image) return;
    setLoading(true);
    setResult(null);
    
    const prompt = input || "Ushbu kimyoviy masalani yechib bering.";
    const response = await solveChemistryProblem(prompt, image || undefined);
    setResult(response);
    setLoading(false);
  };

  const clear = () => {
    setInput('');
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-magnifying-glass-chart text-emerald-500 mr-2"></i>
          Masala Yechish
        </h2>
        
        <div className="space-y-4">
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Masala matnini kiriting yoki reaksiya yozing (masalan: NaOH + HCl = ?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
            >
              <i className="fa-solid fa-camera"></i>
              <span>Rasm yuborish</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {image && (
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 animate-pulse">
                <i className="fa-solid fa-check-circle mr-2"></i>
                <span className="text-sm">Rasm yuklandi</span>
                <button onClick={() => setImage(null)} className="ml-2 hover:text-emerald-900">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSolve}
              disabled={loading || (!input && !image)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Tahlil qilinmoqda...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Yechimni ko'rish</span>
                </>
              )}
            </button>
            <button
              onClick={clear}
              className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
              title="Tozalash"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Yechim:</h3>
            <button onClick={() => navigator.clipboard.writeText(result)} className="text-slate-400 hover:text-emerald-600 transition-colors">
              <i className="fa-solid fa-copy"></i>
            </button>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolver;
