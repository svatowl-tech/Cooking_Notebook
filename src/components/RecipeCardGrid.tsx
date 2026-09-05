import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, Utensils, Star, ChefHat, Sparkles } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface RecipeCardGridProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddRecipe: () => void;
  onOpenClipboardImport: () => void;
  selectedCategory: string;
  searchQuery: string;
}

export const RecipeCardGrid: React.FC<RecipeCardGridProps> = ({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  onOpenAddRecipe,
  onOpenClipboardImport,
  selectedCategory,
  searchQuery,
}) => {
  if (recipes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 text-center bg-paper-warm notebook-page-shadow rounded-2xl border border-[#D4CEBE]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EFE8D8] flex items-center justify-center text-[#7A5C43]">
          <ChefHat className="w-8 h-8" />
        </div>
        <h3 className="font-serif-title text-2xl font-bold text-[#3B2319] mb-2">
          {searchQuery
            ? 'Рецепты не найдены'
            : `Страницы категории "${selectedCategory}" пока пусты`}
        </h3>
        <p className="text-sm text-[#6E5544] font-san-francisco max-w-md mx-auto mb-6">
          {searchQuery
            ? 'Попробуйте изменить поисковый запрос или сбросить фильтр по категориям.'
            : 'Добавьте свой первый рецепт вручную или мгновенно распознайте скопированный текст из буфера обмена!'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic(30);
              onOpenClipboardImport();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Вставить из буфера
          </button>
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic(40);
              onOpenAddRecipe();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C875] text-[#2A1C15] text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            Записать рецепт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {recipes.map((recipe) => {
        // Calculate total estimated prep time from step timers
        const totalTimerSec = recipe.steps.reduce((acc, step) => acc + (step.timerDurationSeconds || 0), 0);
        const totalTimerMin = Math.round(totalTimerSec / 60);

        return (
          <div
            key={recipe.id}
            onClick={() => {
              playClickSound();
              triggerHaptic(20);
              onSelectRecipe(recipe);
            }}
            className="group relative bg-paper-warm notebook-stack-right rounded-2xl border border-[#D8CFC0] overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-200"
          >
            {/* Binder Spiral Holes Top Accent */}
            <div className="bg-[#EFE8D8] px-3 py-1.5 border-b border-[#D8CFC0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="ring-hole" />
                <div className="ring-hole" />
                <div className="ring-hole" />
              </div>
              <span className="text-[10px] font-bold text-[#8C6B50] uppercase tracking-wider font-san-francisco">
                {recipe.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="ring-hole" />
                <div className="ring-hole" />
              </div>
            </div>

            {/* Cover Photo or Skeuomorphic Decorative Placeholder */}
            <div className="relative h-44 bg-[#E2D8C3] overflow-hidden">
              {recipe.coverPhotoBase64 ? (
                <img
                  src={recipe.coverPhotoBase64}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-paper-dots flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#D8CBB5] flex items-center justify-center text-[#70523C] mb-2">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <span className="font-handwriting text-xl text-[#70523C] font-semibold">
                    {recipe.title}
                  </span>
                </div>
              )}

              {/* Favorite Star Button */}
              <button
                onClick={(e) => onToggleFavorite(recipe.id, e)}
                className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md shadow-md transition ${
                  recipe.isFavorite
                    ? 'bg-amber-100/90 text-amber-500 hover:bg-white'
                    : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-white'
                }`}
                title={recipe.isFavorite ? 'Убрать из избранного' : 'В избранное'}
              >
                <Star className={`w-4 h-4 ${recipe.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Servings Tag */}
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-300" />
                <span>{recipe.servings} порц.</span>
              </div>
            </div>

            {/* Recipe Content Summary */}
            <div className="p-4">
              <h3 className="font-serif-title text-lg font-bold text-[#2A1C15] group-hover:text-[#8C5828] transition-colors line-clamp-1 mb-1">
                {recipe.title}
              </h3>

              {recipe.description && (
                <p className="text-xs text-[#6B5242] font-san-francisco line-clamp-2 mb-3">
                  {recipe.description}
                </p>
              )}

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E6DEC8] text-[11px] font-medium text-[#7A614E]">
                <div className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-[#A67853]" />
                  <span>{recipe.ingredients.length} ингр.</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A67853]" />
                  <span>{recipe.steps.length} шагов {totalTimerMin > 0 ? `(~${totalTimerMin} м)` : ''}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
