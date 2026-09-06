import React, { useState, useMemo } from 'react';
import { useRecipeDB } from './hooks/useRecipeDB';
import { useCookTimer } from './hooks/useCookTimer';
import { Recipe, CategoryType } from './types';
import { SkeuomorphicHeader } from './components/SkeuomorphicHeader';
import { RecipeCardGrid } from './components/RecipeCardGrid';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeEditor } from './components/RecipeEditor';
import { ClipboardImportModal } from './components/ClipboardImportModal';
import { ChefMode } from './components/ChefMode';
import { RecipePosterCard } from './components/RecipePosterCard';
import { BackupModal } from './components/BackupModal';
import { AIPromptGeneratorModal } from './components/AIPromptGeneratorModal';
import { SettingsModal } from './components/SettingsModal';
import { ActiveTimersBar } from './components/ActiveTimersBar';

export default function App() {
  const {
    recipes,
    backups,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    exportJSON,
    importJSON,
    restoreFromBackupSnapshot,
    resetToSeedData,
  } = useRecipeDB();

  const {
    activeTimers,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    addExtraMinute,
    formatTime,
  } = useCookTimer();

  // App View Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'add' | 'edit' | 'chef'>('list');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [chefModeMultiplier, setChefModeMultiplier] = useState<number>(1);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Все рецепты');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [isClipboardModalOpen, setIsClipboardModalOpen] = useState(false);
  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [posterRecipe, setPosterRecipe] = useState<Recipe | null>(null);

  // Active selected recipe derivation
  const selectedRecipe = useMemo(() => {
    return recipes.find((r) => r.id === selectedRecipeId) || null;
  }, [recipes, selectedRecipeId]);

  // Category and Search Filtered Recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      // Category filter
      if (selectedCategory === 'Избранное') {
        if (!r.isFavorite) return false;
      } else if (selectedCategory !== 'Все рецепты') {
        if (r.category !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesIng = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
        const matchesCategory = r.category.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesIng || matchesCategory;
      }

      return true;
    });
  }, [recipes, selectedCategory, searchQuery]);

  // Handler for saving added or parsed recipe
  const handleSaveRecipeData = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentView === 'edit' && selectedRecipeId) {
      await updateRecipe(selectedRecipeId, recipeData);
      setCurrentView('detail');
    } else {
      const newId = await addRecipe(recipeData);
      setSelectedRecipeId(newId);
      setCurrentView('detail');
    }
  };

  return (
    <div className="min-h-screen bg-[#2D1B14] text-[#2C221E] flex flex-col font-san-francisco selection:bg-[#D4AF37] selection:text-[#2A1C15]">
      {/* iOS Skeuomorphic Header (Visible unless in Chef focus mode) */}
      {currentView !== 'chef' && (
        <SkeuomorphicHeader
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (currentView !== 'list') setCurrentView('list');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenClipboardImport={() => setIsClipboardModalOpen(true)}
          onOpenAIPrompt={() => setIsAIPromptModalOpen(true)}
          onOpenAddRecipe={() => {
            setSelectedRecipeId(null);
            setCurrentView('add');
          }}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          totalRecipesCount={recipes.length}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 pb-24 px-2 sm:px-4">
        {currentView === 'list' && (
          <div className="max-w-6xl mx-auto py-6">
            <RecipeCardGrid
              recipes={filteredRecipes}
              onSelectRecipe={(recipe) => {
                setSelectedRecipeId(recipe.id);
                setCurrentView('detail');
              }}
              onToggleFavorite={(id, e) => {
                e.stopPropagation();
                toggleFavorite(id);
              }}
              onOpenAddRecipe={() => {
                setSelectedRecipeId(null);
                setCurrentView('add');
              }}
              onOpenClipboardImport={() => setIsClipboardModalOpen(true)}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {currentView === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setCurrentView('list')}
            onEdit={() => setCurrentView('edit')}
            onDelete={async (id) => {
              await deleteRecipe(id);
              setCurrentView('list');
              setSelectedRecipeId(null);
            }}
            onToggleFavorite={(id) => toggleFavorite(id)}
            onStartChefMode={(recipe, multiplier) => {
              setChefModeMultiplier(multiplier);
              setCurrentView('chef');
            }}
            onOpenPosterCard={(rec) => setPosterRecipe(rec)}
            onStartStepTimer={startTimer}
            activeTimers={activeTimers}
          />
        )}

        {(currentView === 'add' || currentView === 'edit') && (
          <RecipeEditor
            initialRecipe={currentView === 'edit' ? selectedRecipe || undefined : undefined}
            onSave={handleSaveRecipeData}
            onCancel={() => {
              if (currentView === 'edit' && selectedRecipeId) {
                setCurrentView('detail');
              } else {
                setCurrentView('list');
              }
            }}
          />
        )}

        {currentView === 'chef' && selectedRecipe && (
          <ChefMode
            recipe={selectedRecipe}
            servingMultiplier={chefModeMultiplier}
            onClose={() => setCurrentView('detail')}
            activeTimers={activeTimers}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
            onResetTimer={resetTimer}
            onStopTimer={stopTimer}
            formatTime={formatTime}
          />
        )}
      </main>

      {/* Active Parallel Timers Floating Bar */}
      {currentView !== 'chef' && (
        <ActiveTimersBar
          timers={activeTimers}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onStop={stopTimer}
          onAddMinute={addExtraMinute}
          formatTime={formatTime}
        />
      )}

      {/* Clipboard Text Parser Modal */}
      <ClipboardImportModal
        isOpen={isClipboardModalOpen}
        onClose={() => setIsClipboardModalOpen(false)}
        onImportSuccess={(parsedData) => {
          handleSaveRecipeData(parsedData);
        }}
      />

      {/* AI Prompt Generator Modal */}
      <AIPromptGeneratorModal
        isOpen={isAIPromptModalOpen}
        onClose={() => setIsAIPromptModalOpen(false)}
      />

      {/* Poster & Print Card Generator Modal */}
      {posterRecipe && (
        <RecipePosterCard
          recipe={posterRecipe}
          onClose={() => setPosterRecipe(null)}
        />
      )}

      {/* Database Backup & Restore Safety Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onExportJSON={exportJSON}
        onImportJSON={importJSON}
        backups={backups}
        onRestoreBackup={restoreFromBackupSnapshot}
        onResetToSeed={resetToSeedData}
      />

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      )}
    </div>
  );
}
