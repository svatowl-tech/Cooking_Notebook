import React, { useRef, useState } from 'react';
import { Recipe, UNIT_LABELS } from '../types';
import { X, Share2, Printer, Download, Utensils, Clock, Users, Copy, Check, FileText, Sparkles } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface RecipePosterCardProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipePosterCard: React.FC<RecipePosterCardProps> = ({
  recipe,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Calculate total cooking time from steps
  const totalSeconds = recipe.steps.reduce((acc, st) => acc + (st.timerDurationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalTimeStr = totalMinutes > 0
    ? totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)} ч ${totalMinutes % 60 ? `${totalMinutes % 60} мин` : ''}`.trim()
      : `${totalMinutes} мин`
    : null;

  // Generate clean, comprehensive text for clipboard, web share, and .txt download
  const generateExportText = (): string => {
    let text = `🍳 РЕЦЕПТ: ${recipe.title.toUpperCase()}\n`;
    if (recipe.category) text += `Категория: ${recipe.category}\n`;
    text += `👥 Порций: ${recipe.servings}\n`;
    if (totalTimeStr) text += `⏱ Общее время: ~${totalTimeStr}\n`;
    if (recipe.description) text += `\nОписание: «${recipe.description}»\n`;

    text += `\n📋 ИНГРЕДИЕНТЫ:\n`;
    recipe.ingredients.forEach((ing) => {
      const amtStr = ing.amount > 0 ? `${ing.amount} ${UNIT_LABELS[ing.unit] || ing.unit}` : 'по вкусу';
      const optStr = ing.isOptional ? ' (по желанию)' : '';
      const subStr = ing.substitutes && ing.substitutes.length > 0 ? ` [замена: ${ing.substitutes.join(', ')}]` : '';
      text += `  • ${ing.name}: ${amtStr}${optStr}${subStr}\n`;
    });

    text += `\n👨‍🍳 ПОШАГОВОЕ ПРИГОТОВЛЕНИЕ:\n`;
    recipe.steps.forEach((st) => {
      const stepMin = st.timerDurationSeconds ? Math.round(st.timerDurationSeconds / 60) : 0;
      const timeBadge = stepMin > 0 ? ` [⏱ ${stepMin} мин]` : '';
      text += `\nШаг ${st.stepNumber}${timeBadge}:\n${st.instruction}\n`;

      if (st.ingredients && st.ingredients.length > 0) {
        text += `  Ингредиенты для шага (грамовки):\n`;
        st.ingredients.forEach((ing) => {
          const amtStr = ing.amount > 0 ? `${ing.amount} ${UNIT_LABELS[ing.unit] || ing.unit}` : 'по вкусу';
          const optStr = ing.isOptional ? ' (по желанию)' : '';
          text += `    - ${ing.name}: ${amtStr}${optStr}\n`;
        });
      }

      if (st.tips) {
        text += `  💡 Совет: ${st.tips}\n`;
      }
    });

    text += `\n---\nСоздано в приложении «Кулинарный Блокнот»`;
    return text;
  };

  const handleCopyText = async () => {
    triggerHaptic(35);
    playClickSound();
    const shareText = generateExportText();

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic(30);
    playClickSound();
    const shareText = generateExportText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopyText();
    }
  };

  const handleDownloadTxt = () => {
    triggerHaptic(30);
    playClickSound();
    const shareText = generateExportText();
    const blob = new Blob([shareText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/[/\\?%*:|"<>]/g, '_')}_рецепт.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    triggerHaptic(30);
    playClickSound();
    const jsonStr = JSON.stringify(recipe, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    triggerHaptic(30);
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[92dvh] bg-[#FDFBF7] rounded-2xl border-2 border-[#D4AF37] shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Modal Top Header */}
        <div className="shrink-0 bg-[#2D1B14] text-[#E6C875] p-3 sm:p-4 border-b border-[#4A3226] flex items-center justify-between no-print">
          <div className="flex items-center gap-2 min-w-0">
            <Share2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif-title text-base sm:text-lg font-bold truncate">
                Экспорт рецепта и печать
              </h3>
              <p className="text-[11px] text-amber-200/70 truncate">
                {recipe.title} • {recipe.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-[#4A3226] text-amber-200 active:scale-95 transition"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Poster Sheet Body */}
        <div
          ref={cardRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-paper-warm text-[#2C1D16] overscroll-contain"
        >
          {/* Header Banner */}
          <div className="text-center border-b-2 border-[#D4AF37] pb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C5828]">
              — Кулинарный Блокнот • {recipe.category} —
            </span>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#2C1D16] mt-1">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="font-handwriting text-lg sm:text-xl text-[#7A5C43] mt-1">
                «{recipe.description}»
              </p>
            )}
          </div>

          {/* Cover Photo */}
          {recipe.coverPhotoBase64 && (
            <div className="rounded-xl overflow-hidden max-h-72 border border-[#C5BBAA] shadow-sm">
              <img src={recipe.coverPhotoBase64} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Servings, Total Cooking Time, Ingredients & Steps Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-4 bg-[#F0E6D2] rounded-xl border border-[#DECBB3] text-xs font-bold text-[#6B4B35]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#8C5828] shrink-0" />
              <span>{recipe.servings} порций</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8C5828] shrink-0" />
              <span>{totalTimeStr || `${recipe.steps.length * 5} мин`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#8C5828] shrink-0" />
              <span>{recipe.ingredients.length} ингр.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8C5828] shrink-0" />
              <span>{recipe.steps.length} шагов</span>
            </div>
          </div>

          {/* Ingredients Grid */}
          <div>
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#2C1D16] mb-2 border-b border-[#DECBB3] pb-1 flex items-center justify-between">
              <span>Ингредиенты</span>
              <span className="text-xs font-normal text-[#8C705A]">На {recipe.servings} порций</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-san-francisco">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="p-2.5 rounded-lg bg-[#FAF6EC] border border-[#DECBB3] flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-[#2C1D16] truncate">{ing.name}</span>
                    {ing.isOptional && (
                      <span className="text-[9px] uppercase tracking-wide font-bold bg-[#DECBB3] text-[#6B4B35] px-1.5 py-0.5 rounded shrink-0">
                        по желанию
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#8C5828] shrink-0">
                    {ing.amount > 0 ? `${ing.amount} ${UNIT_LABELS[ing.unit] || ing.unit}` : 'по вкусу'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Chronicle with Step Ingredients (Grammages) & Time */}
          <div>
            <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#2C1D16] mb-3 border-b border-[#DECBB3] pb-1 flex items-center justify-between">
              <span>Пошаговое приготовление</span>
              {totalTimeStr && (
                <span className="text-xs font-normal text-[#8C705A]">Время: ~{totalTimeStr}</span>
              )}
            </h3>
            <div className="space-y-4 text-xs font-san-francisco">
              {recipe.steps.map((st) => {
                const stepMin = st.timerDurationSeconds ? Math.round(st.timerDurationSeconds / 60) : 0;
                return (
                  <div key={st.id} className="p-3.5 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3 shadow-2xs">
                    {/* Step Title & Instruction */}
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-[#8C5828] text-sm sm:text-base leading-none pt-0.5">
                        {st.stepNumber}.
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#6B4B35] text-xs">Шаг {st.stepNumber}</span>
                          {stepMin > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              <span>{stepMin} мин</span>
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed text-[#2C1D16] text-xs sm:text-sm">{st.instruction}</p>
                      </div>
                    </div>

                    {/* Step-specific ingredients & grammages */}
                    {st.ingredients && st.ingredients.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-[#DECBB3] pl-6">
                        <span className="text-[11px] font-bold text-[#8C5828] block mb-1.5">
                          Ингредиенты для этого шага:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {st.ingredients.map((ing) => (
                            <span
                              key={ing.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-[#DECBB3] text-[11px] text-[#2C1D16]"
                            >
                              <span className="font-medium">{ing.name}:</span>
                              <span className="font-bold text-[#8C5828]">
                                {ing.amount > 0 ? `${ing.amount} ${UNIT_LABELS[ing.unit] || ing.unit}` : 'по вкусу'}
                              </span>
                              {ing.isOptional && (
                                <span className="text-[9px] text-[#8C705A] italic">(по желанию)</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step tip */}
                    {st.tips && (
                      <div className="text-[11px] text-[#7A614E] italic bg-[#F4EBD9] p-2 rounded-lg border border-[#DECBB3] pl-6">
                        💡 {st.tips}
                      </div>
                    )}

                    {/* Step Photo */}
                    {st.photoBase64 && (
                      <img
                        src={st.photoBase64}
                        alt={`Шаг ${st.stepNumber}`}
                        className="rounded-lg h-36 object-cover border border-[#DECBB3] w-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-4 border-t border-[#D4AF37] text-[10px] text-[#8C705A] uppercase tracking-widest">
            Создано в приложении «Кулинарный Блокнот»
          </div>
        </div>

        {/* Sticky Modal Bottom Action Bar (ALWAYS Visible, never cut off!) */}
        <div className="shrink-0 bg-[#241610] p-3 sm:p-4 border-t border-[#4A3226] flex flex-wrap items-center justify-between gap-2 shadow-2xl no-print">
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Formatted Text Button */}
            <button
              onClick={handleCopyText}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E6C875] hover:to-[#C5A059] text-[#2A1C15]'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать рецепт'}</span>
            </button>

            {/* Native Share Button */}
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Поделиться</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 border border-[#6B4731] text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Download TXT Button */}
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200/90 border border-[#6B4731] text-xs font-medium transition active:scale-95"
              title="Скачать файл рецепта (.txt)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>.TXT</span>
            </button>

            {/* Download JSON Button */}
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200/90 border border-[#6B4731] text-xs font-medium transition active:scale-95"
              title="Скачать файл рецепта (.json)"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>.JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
