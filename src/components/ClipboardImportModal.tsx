import React, { useState } from 'react';
import { useRecipeParser } from '../hooks/useRecipeParser';
import { Recipe } from '../types';
import { Clipboard, Sparkles, Check, AlertCircle, X, ArrowRight, Wand2 } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface ClipboardImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (parsedData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ClipboardImportModal: React.FC<ClipboardImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [inputText, setInputText] = useState('');
  const { isParsing, parsedResult, parseError, parseText, resetParser } = useRecipeParser();

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      triggerHaptic(25);
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clip = await navigator.clipboard.readText();
        if (clip) {
          setInputText(clip);
          parseText(clip);
          return;
        }
      }
      alert('Скопируйте текст рецепта и вставьте в текстовое поле вручную.');
    } catch {
      alert('Вставьте текст рецепта в поле вручную.');
    }
  };

  const handleParseClick = () => {
    triggerHaptic(30);
    parseText(inputText);
  };

  const handleConfirmImport = () => {
    if (!parsedResult) return;
    triggerHaptic(50);
    onImportSuccess({
      title: parsedResult.title,
      description: parsedResult.description,
      category: parsedResult.category,
      servings: parsedResult.servings,
      ingredients: parsedResult.ingredients,
      steps: parsedResult.steps,
    });
    onClose();
    resetParser();
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-paper-warm notebook-page-shadow rounded-2xl border-2 border-[#D4AF37] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#2D1B14] text-[#E6C875] p-4 border-b border-[#4A3226] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#4A3226] text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title text-lg font-bold">
                Распознавание из буфера
              </h3>
              <p className="text-[10px] text-amber-200/60 font-san-francisco">
                Локальный детерминированный парсер (без ИИ и интернета)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-[#4A3226] text-amber-200/80 hover:text-amber-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {!parsedResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#3B2319] uppercase tracking-wider">
                  Вставьте произвольный текст рецепта:
                </label>
                <button
                  onClick={handlePasteFromClipboard}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold transition"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Вставить из буфера
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Скопируйте сюда любой текст с сайта, из заметки или мессенджера...
Например:
Паста Карбонара
Ингредиенты:
- Спагетти 200г
- Бекон 100г
- 2 яйца
Приготовление:
1. Варить спагетти 9 минут.
2. Обжарить бекон 5 минут..."
                rows={8}
                className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-xs font-san-francisco rounded-xl p-3 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
              />

              {parseError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <button
                onClick={handleParseClick}
                disabled={!inputText.trim() || isParsing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E6C875] text-[#2A1C15] font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>Распознать ингредиенты и шаги</span>
              </button>
            </div>
          ) : (
            /* Parsed Result Interactive Preview */
            <div className="space-y-4">
              <div className="p-3 bg-[#F0E6D2] border border-[#DECBB3] rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C5828]">
                  Успешно распознано: {parsedResult.ingredients.length} ингред., {parsedResult.steps.length} шагов
                </span>
                <button
                  onClick={resetParser}
                  className="text-xs text-[#8C5828] underline hover:text-[#5E3917]"
                >
                  Вставить другой текст
                </button>
              </div>

              {/* Title & Category Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#3B2319] uppercase tracking-wider block">
                  Заголовок:
                </span>
                <input
                  type="text"
                  value={parsedResult.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    parsedResult.title = val;
                  }}
                  className="w-full bg-white text-[#2C1D16] text-base font-bold font-serif-title rounded-xl p-2.5 border border-[#C5BBAA]"
                />
              </div>

              {/* Ingredients List Preview */}
              <div>
                <span className="text-xs font-bold text-[#3B2319] uppercase tracking-wider block mb-2">
                  Выделенные ингредиенты:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {parsedResult.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAF6EC] border border-[#DECBB3] text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-[#2C1D16]">{ing.name}</span>
                      <span className="font-bold text-[#8C5828]">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps List Preview with Detected Timers */}
              <div>
                <span className="text-xs font-bold text-[#3B2319] uppercase tracking-wider block mb-2">
                  Шаги готовки с авто-таймерами:
                </span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {parsedResult.steps.map((st) => (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-lg bg-[#FAF6EC] border border-[#DECBB3] text-xs space-y-1"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#8C5828]">
                          {st.stepNumber}.
                        </span>
                        <p className="text-[#2C1D16] flex-1 font-san-francisco">
                          {st.instruction}
                        </p>
                      </div>
                      {st.timerDurationSeconds && (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-600 text-amber-50 text-[10px] font-bold">
                          Распознан таймер: {Math.round(st.timerDurationSeconds / 60)} мин
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {parsedResult && (
          <div className="p-4 bg-[#EFE8D8] border-t border-[#D4CEBE] flex items-center justify-between gap-3">
            <button
              onClick={resetParser}
              className="px-4 py-2 rounded-xl bg-[#D8CBB5] text-[#2C1D16] font-bold text-xs hover:bg-[#C8BAA5]"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E6C875] text-[#2A1C15] font-bold text-xs shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Добавить в кулинарный блокнот</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
