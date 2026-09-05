import React, { useRef } from 'react';
import { Recipe, UNIT_LABELS } from '../types';
import { X, Share2, Printer, Download, Utensils, Clock, Users } from 'lucide-react';
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

  const handleNativeShare = async () => {
    triggerHaptic(30);
    const shareText = `🍳 Рецепт: ${recipe.title}\n\nИнгредиенты:\n${recipe.ingredients
      .map((i) => `• ${i.name}: ${i.amount} ${UNIT_LABELS[i.unit] || i.unit}`)
      .join('\n')}\n\nПошаговый рецепт из Кулинарного Блокнота!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText,
        });
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      alert('Текст рецепта скопирован в буфер обмена!');
    }
  };

  const handlePrint = () => {
    triggerHaptic(30);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-paper-warm notebook-page-shadow rounded-2xl border-2 border-[#D4AF37] my-8 overflow-hidden flex flex-col">
        {/* Top Modal Header */}
        <div className="bg-[#2D1B14] text-[#E6C875] p-4 border-b border-[#4A3226] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif-title text-lg font-bold">
              Карточка рецепта для печати / соцсетей
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Поделиться</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C875] text-[#2A1C15] text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-[#4A3226] text-amber-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Poster Sheet (A4 Layout) */}
        <div ref={cardRef} className="p-8 space-y-6 bg-paper-warm text-[#2C1D16]">
          {/* Header Banner */}
          <div className="text-center border-b-2 border-[#D4AF37] pb-4">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8C5828]">
              — Кулинарный Блокнот • {recipe.category} —
            </span>
            <h1 className="font-serif-title text-3xl font-extrabold text-[#2C1D16] mt-1">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="font-handwriting text-xl text-[#7A5C43] mt-1">
                «{recipe.description}»
              </p>
            )}
          </div>

          {/* Cover Photo */}
          {recipe.coverPhotoBase64 && (
            <div className="rounded-xl overflow-hidden max-h-72 border border-[#C5BBAA]">
              <img src={recipe.coverPhotoBase64} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Servings & Stats Banner */}
          <div className="flex items-center justify-around py-3 bg-[#F0E6D2] rounded-xl border border-[#DECBB3] text-xs font-bold text-[#6B4B35]">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#8C5828]" />
              <span>{recipe.servings} порций</span>
            </div>
            <div className="flex items-center gap-1">
              <Utensils className="w-4 h-4 text-[#8C5828]" />
              <span>{recipe.ingredients.length} ингредиентов</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#8C5828]" />
              <span>{recipe.steps.length} шагов</span>
            </div>
          </div>

          {/* Ingredients Grid */}
          <div>
            <h3 className="font-serif-title text-lg font-bold text-[#2C1D16] mb-2 border-b border-[#DECBB3] pb-1">
              Ингредиенты
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-san-francisco">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="p-2 rounded bg-[#FAF6EC] border border-[#DECBB3] flex justify-between">
                  <span className="font-medium text-[#2C1D16]">{ing.name}</span>
                  <span className="font-bold text-[#8C5828]">
                    {ing.amount > 0 ? `${ing.amount} ${UNIT_LABELS[ing.unit] || ing.unit}` : 'по вкусу'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Chronicle */}
          <div>
            <h3 className="font-serif-title text-lg font-bold text-[#2C1D16] mb-2 border-b border-[#DECBB3] pb-1">
              Приготовление
            </h3>
            <div className="space-y-3 text-xs font-san-francisco">
              {recipe.steps.map((st) => (
                <div key={st.id} className="p-3 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#8C5828] text-sm">{st.stepNumber}.</span>
                    <p className="leading-relaxed text-[#2C1D16] flex-1">{st.instruction}</p>
                  </div>
                  {st.photoBase64 && (
                    <img src={st.photoBase64} alt={`Шаг ${st.stepNumber}`} className="rounded-lg h-32 object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4 border-t border-[#D4AF37] text-[10px] text-[#8C705A] uppercase tracking-widest">
            Создано в приложении «Кулинарный Блокнот»
          </div>
        </div>
      </div>
    </div>
  );
};
