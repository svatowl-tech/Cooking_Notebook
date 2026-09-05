import React from 'react';
import { CATEGORIES, CategoryType } from '../types';
import { Search, Clipboard, Plus, HardDriveDownload, Star, BookOpen } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface SkeuomorphicHeaderProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenClipboardImport: () => void;
  onOpenAddRecipe: () => void;
  onOpenBackupModal: () => void;
  totalRecipesCount: number;
}

export const SkeuomorphicHeader: React.FC<SkeuomorphicHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenClipboardImport,
  onOpenAddRecipe,
  onOpenBackupModal,
  totalRecipesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#2D1B14] text-[#FDFBF7] shadow-2xl border-b-2 border-[#1A0F0A]">
      {/* Leather Cover Top Banner with Gold Embossing */}
      <div className="bg-leather px-4 py-3 border-b border-[#4A3226] relative overflow-hidden">
        {/* Subtle gold decorative stitch edge */}
        <div className="absolute top-1 left-2 right-2 border-t border-dashed border-[#C5A059]/30 pointer-events-none" />
        <div className="absolute bottom-1 left-2 right-2 border-b border-dashed border-[#C5A059]/30 pointer-events-none" />

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Gold Embossed Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997A15] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#2D1B14] rounded-[10px] flex items-center justify-center text-[#E6C875]">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h1 className="font-serif-title text-xl md:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA882A] drop-shadow-sm">
                Кулинарный Блокнот
              </h1>
              <p className="text-[10px] text-amber-200/60 font-san-francisco uppercase tracking-wider">
                iOS Offline Notebook • {totalRecipesCount} рецептов
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1.5">
            {/* Clipboard Paste Import Button */}
            <button
              onClick={() => {
                playClickSound();
                triggerHaptic(30);
                onOpenClipboardImport();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-medium border border-[#8C6239]/50 shadow-sm active:scale-95 transition"
              title="Импорт из буфера обмена"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Из буфера</span>
            </button>

            {/* Backup/Restore Button */}
            <button
              onClick={() => {
                playClickSound();
                triggerHaptic(30);
                onOpenBackupModal();
              }}
              className="p-1.5 rounded-lg bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] border border-[#8C6239]/50 shadow-sm active:scale-95 transition"
              title="Бэкап / Экспорт JSON"
            >
              <HardDriveDownload className="w-4 h-4" />
            </button>

            {/* Add Recipe Button */}
            <button
              onClick={() => {
                playClickSound();
                triggerHaptic(40);
                onOpenAddRecipe();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E6C875] hover:to-[#C5A059] text-[#2A1C15] font-bold text-xs shadow-md active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Создать</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#241610] px-4 py-2 border-b border-[#3D261A]">
        <div className="max-w-4xl mx-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-200/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск рецептов, ингредиентов или заметок..."
            className="w-full bg-[#180E0A] text-amber-100 placeholder-amber-200/40 text-xs rounded-xl pl-9 pr-3 py-2 border border-[#4A3226] focus:outline-none focus:border-[#D4AF37]/70 font-san-francisco shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2 text-amber-200/50 hover:text-amber-100 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bookmark Ribbon Tabs for Category Selection */}
      <div className="bg-[#1C110C] px-2 py-1.5 overflow-x-auto no-scrollbar shadow-inner">
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 min-w-max">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  triggerHaptic(20);
                  onSelectCategory(cat);
                }}
                className={`ribbon-tab px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1 transition-all border-t border-x ${
                  isSelected
                    ? 'bg-[#FDFBF7] text-[#2C221E] border-[#D4AF37] shadow-md font-bold transform -translate-y-0.5'
                    : 'bg-[#2A1C15] text-amber-200/70 border-[#3D2A20] hover:text-amber-100 hover:bg-[#38261E]'
                }`}
              >
                {cat === 'Все рецепты' && <BookOpen className="w-3 h-3 text-amber-700" />}
                {cat === 'Избранное' && <Star className="w-3 h-3 fill-amber-400 text-amber-500" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
