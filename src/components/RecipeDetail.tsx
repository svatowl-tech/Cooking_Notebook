import React, { useState } from 'react';
import { Recipe, UNIT_LABELS } from '../types';
import {
  ArrowLeft,
  ChefHat,
  Printer,
  Share2,
  Edit,
  Trash2,
  Users,
  Timer,
  Play,
  CheckCircle2,
  Star,
  Info,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';
import { ActiveTimer } from '../hooks/useCookTimer';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStartChefMode: (recipe: Recipe) => void;
  onOpenPosterCard: (recipe: Recipe) => void;
  onStartStepTimer: (stepId: string, stepNumber: number, recipeTitle: string, durationSeconds: number) => void;
  activeTimers: ActiveTimer[];
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStartChefMode,
  onOpenPosterCard,
  onStartStepTimer,
  activeTimers,
}) => {
  // Dynamic serving size scaler state
  const [currentServings, setCurrentServings] = useState<number>(recipe.servings || 4);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const servingMultiplier = currentServings / (recipe.servings || 1);

  const toggleStepCompleted = (stepId: string) => {
    triggerHaptic(25);
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handlePrint = () => {
    triggerHaptic(30);
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Top Navigation & Action Toolbar (Hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#241610] p-3 rounded-2xl border border-[#4A3226] text-amber-100 shadow-xl">
        <button
          onClick={() => {
            playClickSound();
            triggerHaptic(20);
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 text-xs font-semibold border border-[#6B4731] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к блокноту</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Favorite Toggle */}
          <button
            onClick={() => {
              triggerHaptic(30);
              onToggleFavorite(recipe.id);
            }}
            className={`p-2 rounded-xl border transition ${
              recipe.isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-[#3B261A] text-amber-200/70 border-[#6B4731] hover:text-amber-100'
            }`}
            title="Избранное"
          >
            <Star className={`w-4 h-4 ${recipe.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Chef Mode Focus Launcher Button */}
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic(50);
              onStartChefMode(recipe);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg border border-emerald-500/40 active:scale-95 transition"
          >
            <ChefHat className="w-4 h-4 text-emerald-200" />
            <span>Шеф-повар</span>
          </button>

          {/* Poster & Web Share */}
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic(30);
              onOpenPosterCard(recipe);
            }}
            className="p-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 border border-[#6B4731] active:scale-95 transition"
            title="Постер / Поделиться"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 border border-[#6B4731] active:scale-95 transition"
            title="Печать / Сохранить в PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Edit Recipe */}
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic(30);
              onEdit(recipe);
            }}
            className="p-2 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 border border-[#6B4731] active:scale-95 transition"
            title="Редактировать"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete Recipe */}
          <button
            onClick={() => {
              if (window.confirm(`Вы уверены, что хотите удалить рецепт "${recipe.title}"?`)) {
                triggerHaptic(50);
                onDelete(recipe.id);
              }
            }}
            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 active:scale-95 transition"
            title="Удалить рецепт"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Skeuomorphic Paper Notebook Sheet */}
      <article className="bg-paper-warm notebook-page-shadow rounded-2xl border border-[#D4CEBE] p-5 sm:p-8 relative overflow-hidden">
        {/* Notebook Spiral Hole Banner */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-[#EFE8D8] border-b border-[#D4CEBE] flex items-center justify-around px-4">
          <div className="flex items-center gap-4">
            <div className="ring-hole" />
            <div className="ring-hole" />
            <div className="ring-hole" />
          </div>
          <div className="flex items-center gap-4">
            <div className="ring-hole" />
            <div className="ring-hole" />
            <div className="ring-hole" />
          </div>
        </div>

        <div className="pt-6 space-y-6">
          {/* Header & Title */}
          <div className="border-b-2 border-dashed border-[#C5BBAA] pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8DEC8] text-[#6E5039] text-xs font-bold font-san-francisco uppercase tracking-wider">
                {recipe.category}
              </span>
              <span className="text-xs text-[#8C705A] font-san-francisco">
                Записано: {new Date(recipe.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>

            <h1 className="font-serif-title text-2xl sm:text-4xl font-extrabold text-[#2C1D16] leading-tight">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="mt-2 font-handwriting text-xl sm:text-2xl text-[#6B4B35] leading-relaxed">
                «{recipe.description}»
              </p>
            )}
          </div>

          {/* Main Cover Image */}
          {recipe.coverPhotoBase64 && (
            <div className="rounded-2xl overflow-hidden border border-[#D4CEBE] shadow-md max-h-96 bg-[#EBE3D3]">
              <img
                src={recipe.coverPhotoBase64}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Interactive Servings Scaler */}
          <div className="bg-[#F3EEDF] p-4 rounded-xl border border-[#DECBB3] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C5828]" />
              <div>
                <span className="font-bold text-sm text-[#2C1D16] block">
                  Количество порций
                </span>
                <span className="text-[11px] text-[#7A614E]">
                  Граммовки пересчитываются автоматически
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FDFBF7] p-1 rounded-xl border border-[#C8BAA5] shadow-inner">
              <button
                onClick={() => {
                  triggerHaptic(20);
                  setCurrentServings((s) => Math.max(1, s - 1));
                }}
                className="w-8 h-8 rounded-lg bg-[#EAE2D0] hover:bg-[#DECBB3] text-[#2C1D16] font-bold text-lg flex items-center justify-center transition active:scale-95"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-base text-[#2C1D16]">
                {currentServings}
              </span>
              <button
                onClick={() => {
                  triggerHaptic(20);
                  setCurrentServings((s) => s + 1);
                }}
                className="w-8 h-8 rounded-lg bg-[#EAE2D0] hover:bg-[#DECBB3] text-[#2C1D16] font-bold text-lg flex items-center justify-center transition active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <h2 className="font-serif-title text-xl font-bold text-[#2C1D16] mb-3 flex items-center gap-2 border-b border-[#D4CEBE] pb-2">
              <span className="w-3 h-3 rounded-full bg-[#8C5828]" />
              Ингредиенты ({recipe.ingredients.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing) => {
                const scaledAmount = ing.unit === 'to_taste' ? 0 : Math.round(ing.amount * servingMultiplier * 10) / 10;
                const unitLabel = UNIT_LABELS[ing.unit] || ing.unit;

                return (
                  <div
                    key={ing.id}
                    className="p-3 rounded-xl bg-[#F8F4EA] border border-[#E0D5C3] flex items-start justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <span className="font-medium text-sm text-[#2C1D16] block">
                        {ing.name}
                      </span>
                      {ing.substitutes && ing.substitutes.length > 0 && (
                        <span className="text-[11px] text-[#A66E38] italic block font-san-francisco">
                          Замена: {ing.substitutes.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="text-right whitespace-nowrap">
                      {ing.unit === 'to_taste' ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#E8DEC8] text-[#7A583A] text-xs font-bold">
                          по вкусу
                        </span>
                      ) : (
                        <span className="font-bold text-sm text-[#8C5828] font-san-francisco">
                          {scaledAmount} {unitLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps Section */}
          <div>
            <h2 className="font-serif-title text-xl font-bold text-[#2C1D16] mb-3 flex items-center gap-2 border-b border-[#D4CEBE] pb-2">
              <span className="w-3 h-3 rounded-full bg-[#8C5828]" />
              Пошаговое приготовление ({recipe.steps.length} этапов)
            </h2>

            <div className="space-y-4">
              {recipe.steps.map((step) => {
                const isCompleted = completedSteps[step.id];
                const activeTimer = activeTimers.find((t) => t.stepId === step.id);

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-[#EAE4D6]/60 border-[#C5BBAA] opacity-75'
                        : 'bg-[#FAF6EC] border-[#DECBB3] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Step Checkbox */}
                      <button
                        onClick={() => toggleStepCompleted(step.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isCompleted
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#E2D8C3] text-[#7A5C43] hover:bg-[#D4C3A3]'
                        }`}
                        title={isCompleted ? 'Отметить как невыполненное' : 'Отметить как готовое'}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-xs">{step.stepNumber}</span>}
                      </button>

                      {/* Step Instruction */}
                      <div className="flex-1 space-y-2">
                        <p
                          className={`text-sm sm:text-base leading-relaxed text-[#2C1D16] font-san-francisco ${
                            isCompleted ? 'line-through text-[#7A6B5D]' : ''
                          }`}
                        >
                          {step.instruction}
                        </p>

                        {/* Tip Box */}
                        {step.tips && (
                          <div className="p-2.5 rounded-xl bg-[#F0E6D2] border border-[#DECBB3] text-xs text-[#6B4B35] flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#8C5828] shrink-0 mt-0.5" />
                            <span><strong>Совет:</strong> {step.tips}</span>
                          </div>
                        )}

                        {/* Step Photo */}
                        {step.photoBase64 && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-[#D4CEBE] max-w-sm">
                            <img src={step.photoBase64} alt={`Шаг ${step.stepNumber}`} className="w-full h-auto" />
                          </div>
                        )}

                        {/* Timer Launcher Button */}
                        {step.timerDurationSeconds && step.timerDurationSeconds > 0 && (
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                playClickSound();
                                triggerHaptic(40);
                                onStartStepTimer(
                                  step.id,
                                  step.stepNumber,
                                  recipe.title,
                                  step.timerDurationSeconds!
                                );
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                                activeTimer
                                  ? 'bg-amber-600 text-white animate-pulse'
                                  : 'bg-[#8C5828] hover:bg-[#73471E] text-amber-50'
                              }`}
                            >
                              <Timer className="w-4 h-4" />
                              <span>
                                {activeTimer
                                  ? `Таймер запущен`
                                  : `Запустить таймер (${Math.round(step.timerDurationSeconds / 60)} мин)`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
