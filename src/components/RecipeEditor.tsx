import React, { useState } from 'react';
import { Recipe, Ingredient, RecipeStep, CATEGORIES, UnitType, UNIT_LABELS } from '../types';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Camera,
  Timer,
  Check,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';
import { compressImageFile } from '../utils/imageCompressor';
import { RecipeTextParser } from '../utils/RecipeTextParser';

interface RecipeEditorProps {
  initialRecipe?: Recipe;
  onSave: (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  initialRecipe,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [category, setCategory] = useState(initialRecipe?.category || 'Горячее');
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [coverPhotoBase64, setCoverPhotoBase64] = useState(initialRecipe?.coverPhotoBase64 || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [
      { id: 'i_1', name: '', amount: 100, unit: 'g' },
    ]
  );
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialRecipe?.steps || [
      { id: 's_1', stepNumber: 1, instruction: '' },
    ]
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // Cover photo upload handler with canvas compression
  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      triggerHaptic(30);
      const compressed = await compressImageFile(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.8 });
      setCoverPhotoBase64(compressed);
    } catch (err) {
      alert('Ошибка при сжатии изображения');
    }
  };

  // Step photo upload handler
  const handleStepPhotoUpload = async (stepIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      triggerHaptic(30);
      const compressed = await compressImageFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 });
      setSteps((prev) => {
        const updated = [...prev];
        updated[stepIndex] = { ...updated[stepIndex], photoBase64: compressed };
        return updated;
      });
    } catch (err) {
      alert('Ошибка при загрузке фото этапа');
    }
  };

  // Add ingredient row
  const addIngredient = () => {
    triggerHaptic(20);
    setIngredients((prev) => [
      ...prev,
      {
        id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        amount: 100,
        unit: 'g',
      },
    ]);
  };

  // Remove ingredient
  const removeIngredient = (id: string) => {
    triggerHaptic(20);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // Quantity stepper (+/-)
  const adjustIngredientAmount = (id: string, delta: number) => {
    triggerHaptic(15);
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newAmount = Math.max(0, i.amount + delta);
          return { ...i, amount: newAmount };
        }
        return i;
      })
    );
  };

  // Add step row
  const addStep = () => {
    triggerHaptic(20);
    setSteps((prev) => [
      ...prev,
      {
        id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        stepNumber: prev.length + 1,
        instruction: '',
      },
    ]);
  };

  // Remove step
  const removeStep = (id: string) => {
    triggerHaptic(20);
    setSteps((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    });
  };

  // Step instruction change with auto-detect timer suggestion
  const handleStepInstructionChange = (stepIndex: number, newInstruction: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      const autoTimerSec = RecipeTextParser.extractTimerSeconds(newInstruction);

      updated[stepIndex] = {
        ...updated[stepIndex],
        instruction: newInstruction,
        timerDurationSeconds: autoTimerSec > 0 ? autoTimerSec : updated[stepIndex].timerDurationSeconds,
      };
      return updated;
    });
  };

  // Form Save Handler
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Пожалуйста, укажите название рецепта');
      return;
    }

    // Merge step ingredients into global ingredients
    let currentGlobalIngredients = [...ingredients];
    
    const cleanSteps = steps.map((s) => {
      // Clean up step ingredients
      const cleanStepIngs = s.ingredients?.filter((i) => i.name.trim().length > 0) || [];
      
      // Sync to global
      cleanStepIngs.forEach(stepIng => {
         const exists = currentGlobalIngredients.find(gIng => gIng.name.toLowerCase() === stepIng.name.toLowerCase());
         if (!exists) {
            currentGlobalIngredients.push({
               ...stepIng,
               id: `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
            });
         }
      });

      return {
        ...s,
        ingredients: cleanStepIngs.length > 0 ? cleanStepIngs : undefined
      };
    }).filter((s) => s.instruction.trim().length > 0);

    const cleanIngredients = currentGlobalIngredients.filter((i) => i.name.trim().length > 0);
    if (cleanIngredients.length === 0 && cleanSteps.length === 0) {
      setValidationError('Добавьте хотя бы один ингредиент или шаг');
      return;
    }

    if (cleanSteps.length === 0) {
      setValidationError('Добавьте хотя бы один шаг приготовления');
      return;
    }

    triggerHaptic(50);
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      servings,
      coverPhotoBase64: coverPhotoBase64 || undefined,
      ingredients: cleanIngredients,
      steps: cleanSteps,
    });
  };

  return (
    <form onSubmit={handleSaveSubmit} className="max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-3 bg-[#241610] p-3 rounded-2xl border border-[#4A3226] text-amber-100 shadow-xl">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            triggerHaptic(20);
            onCancel();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B261A] hover:bg-[#4E3323] text-amber-200 text-xs font-semibold border border-[#6B4731] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Отмена</span>
        </button>

        <h2 className="font-serif-title text-base sm:text-lg font-bold text-[#E6C875]">
          {initialRecipe ? 'Редактирование рецепта' : 'Запись нового рецепта'}
        </h2>

        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E6C875] text-[#2A1C15] font-bold text-xs shadow-md active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          <span>Сохранить</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-bold">
          {validationError}
        </div>
      )}

      {/* Main Paper Form Sheet */}
      <div className="bg-paper-warm notebook-page-shadow rounded-2xl border border-[#D4CEBE] p-5 sm:p-8 space-y-6">
        {/* Title, Category & Servings */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1">
              Название блюда *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Классическая Паста Карбонара"
              className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-base sm:text-lg font-serif-title font-bold rounded-xl px-4 py-2.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1">
              Заметка повара / Краткое описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Секрет вкусного соуса, подача или личные советы..."
              rows={2}
              className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-sm font-handwriting text-xl rounded-xl px-4 py-2 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF6EC] text-[#2C1D16] text-sm font-medium rounded-xl px-3 py-2.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
              >
                {CATEGORIES.filter((c) => c !== 'Все рецепты' && c !== 'Избранное').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1">
                Базовое количество порций
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-10 h-10 rounded-xl bg-[#E2D8C3] text-[#3B2319] font-bold text-lg flex items-center justify-center hover:bg-[#D4C3A3]"
                >
                  -
                </button>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value, 10) || 1)}
                  className="w-16 text-center font-bold text-base bg-[#FAF6EC] text-[#2C1D16] rounded-xl py-2 border border-[#C5BBAA]"
                />
                <button
                  type="button"
                  onClick={() => setServings((s) => s + 1)}
                  className="w-10 h-10 rounded-xl bg-[#E2D8C3] text-[#3B2319] font-bold text-lg flex items-center justify-center hover:bg-[#D4C3A3]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1">
              Главное фото блюда
            </label>
            <div className="flex items-center gap-4">
              {coverPhotoBase64 ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#C5BBAA]">
                  <img src={coverPhotoBase64} alt="Обложка" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverPhotoBase64('')}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-900/80 text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[#C5BBAA] hover:border-[#8C5828] bg-[#FAF6EC] flex flex-col items-center justify-center cursor-pointer text-[#8C6B50] transition">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Загрузить</span>
                  <input type="file" accept="image/*" onChange={handleCoverPhotoUpload} className="hidden" />
                </label>
              )}
              <span className="text-xs text-[#7A614E] font-san-francisco">
                Автоматическое сжатие для экономии памяти
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="pt-4 border-t border-[#DECBB3]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif-title text-lg font-bold text-[#2C1D16]">
              Ингредиенты ({ingredients.length})
            </h3>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8C5828] hover:bg-[#73471E] text-amber-50 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div
                key={ing.id}
                className="p-3 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-[#8C5828] w-5 text-center">
                    {idx + 1}.
                  </span>

                  {/* Ingredient Name */}
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIngredients((prev) =>
                        prev.map((i) => (i.id === ing.id ? { ...i, name: val } : i))
                      );
                    }}
                    placeholder="Название (например: Мука пшеничная)"
                    className="flex-1 min-w-[140px] bg-white text-[#2C1D16] text-xs font-medium rounded-lg px-2.5 py-1.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                  />

                  {/* Stepper + Amount */}
                  <div className="flex items-center gap-1 bg-[#EAE2D0] p-0.5 rounded-lg border border-[#C5BBAA]">
                    <button
                      type="button"
                      onClick={() => adjustIngredientAmount(ing.id, -10)}
                      className="w-6 h-6 rounded bg-white text-[#2C1D16] font-bold text-xs flex items-center justify-center hover:bg-[#E2D8C3]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setIngredients((prev) =>
                          prev.map((i) => (i.id === ing.id ? { ...i, amount: val } : i))
                        );
                      }}
                      className="w-14 text-center text-xs font-bold bg-transparent text-[#2C1D16]"
                    />
                    <button
                      type="button"
                      onClick={() => adjustIngredientAmount(ing.id, 10)}
                      className="w-6 h-6 rounded bg-white text-[#2C1D16] font-bold text-xs flex items-center justify-center hover:bg-[#E2D8C3]"
                    >
                      +
                    </button>
                  </div>

                  {/* Unit Segmented Control */}
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      const u = e.target.value as UnitType;
                      setIngredients((prev) =>
                        prev.map((i) => (i.id === ing.id ? { ...i, unit: u } : i))
                      );
                    }}
                    className="bg-white text-[#2C1D16] text-xs font-bold rounded-lg px-2 py-1.5 border border-[#C5BBAA]"
                  >
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className="p-1.5 text-red-700 hover:text-red-900"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Substitutes Input Tag */}
                <div className="pl-7">
                  <input
                    type="text"
                    value={ing.substitutes ? ing.substitutes.join(', ') : ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const subs = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
                      setIngredients((prev) =>
                        prev.map((i) => (i.id === ing.id ? { ...i, substitutes: subs } : i))
                      );
                    }}
                    placeholder="Возможные замены (через запятую, например: Бекон, Панчетта)"
                    className="w-full bg-[#FAF6EC] text-[#8C6B50] placeholder-[#B0A292] text-[11px] italic rounded-lg px-2 py-1 border border-dashed border-[#C5BBAA]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Section */}
        <div className="pt-4 border-t border-[#DECBB3]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif-title text-lg font-bold text-[#2C1D16]">
              Шаги приготовления ({steps.length})
            </h3>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8C5828] hover:bg-[#73471E] text-amber-50 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить шаг
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs bg-[#8C5828] text-amber-50 px-2.5 py-0.5 rounded-md">
                    Шаг {step.stepNumber}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="text-red-700 hover:text-red-900 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Удалить
                  </button>
                </div>

                <textarea
                  value={step.instruction}
                  onChange={(e) => handleStepInstructionChange(idx, e.target.value)}
                  placeholder="Опишите действия. Ввод времени (например: 'варить 15 минут') автоматически предложит таймер..."
                  rows={2}
                  className="w-full bg-white text-[#2C1D16] placeholder-[#A69585] text-xs font-san-francisco rounded-xl p-2.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                />

                {/* Timer Duration Input / Detection */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3EEDF] p-2 rounded-lg border border-[#DECBB3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B4B35]">
                    <Timer className="w-4 h-4 text-[#8C5828]" />
                    <span className="font-bold">Таймер шага:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={step.timerDurationSeconds ? Math.round(step.timerDurationSeconds / 60) : 0}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value, 10) || 0;
                        setSteps((prev) => {
                          const updated = [...prev];
                          updated[idx] = {
                            ...updated[idx],
                            timerDurationSeconds: mins * 60,
                          };
                          return updated;
                        });
                      }}
                      className="w-16 text-center font-bold text-xs bg-white text-[#2C1D16] rounded-md py-1 border border-[#C5BBAA]"
                    />
                    <span className="text-xs font-bold text-[#6B4B35]">минут</span>
                  </div>
                </div>

                {/* Step Photo Upload & Step Ingredients Button */}
                <div className="flex flex-wrap items-center gap-3">
                  {step.photoBase64 ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#C5BBAA]">
                      <img src={step.photoBase64} alt={`Фото шага ${step.stepNumber}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSteps((prev) => {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], photoBase64: undefined };
                            return updated;
                          });
                        }}
                        className="absolute top-0 right-0 p-0.5 bg-red-900 text-white rounded-bl"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="px-3 py-1.5 rounded-lg border border-dashed border-[#8C6B50] bg-white text-[#8C6B50] hover:bg-[#F0E6D2] text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Фото этапа</span>
                      <input type="file" accept="image/*" onChange={(e) => handleStepPhotoUpload(idx, e)} className="hidden" />
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                       setSteps((prev) => {
                          const updated = [...prev];
                          const newIng: Ingredient = {
                             id: `step_ing_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
                             name: '', amount: 100, unit: 'g'
                          };
                          updated[idx] = {
                             ...updated[idx],
                             ingredients: [...(updated[idx].ingredients || []), newIng]
                          };
                          return updated;
                       });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-dashed border-[#6B4B35] bg-[#EFE8D8] text-[#6B4B35] hover:bg-[#E2D8C3] text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ингредиент к шагу</span>
                  </button>
                </div>

                {/* Step Ingredients List */}
                {step.ingredients && step.ingredients.length > 0 && (
                   <div className="mt-2 pl-2 border-l-2 border-[#D4CEBE] space-y-2">
                     <span className="text-[10px] font-bold text-[#8C5828] uppercase tracking-wider">Ингредиенты для этого шага:</span>
                     {step.ingredients.map((ing, ingIdx) => (
                        <div key={ing.id} className="flex flex-wrap items-center gap-2">
                          <input
                             type="text"
                             value={ing.name}
                             onChange={(e) => {
                                setSteps((prev) => {
                                   const updated = [...prev];
                                   if (updated[idx].ingredients) {
                                      updated[idx].ingredients[ingIdx].name = e.target.value;
                                   }
                                   return updated;
                                });
                             }}
                             placeholder="Название"
                             className="flex-1 min-w-[120px] bg-white text-[#2C1D16] text-xs font-bold rounded-lg px-2 py-1.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                          />
                          <input
                             type="number"
                             value={ing.amount}
                             onChange={(e) => {
                                setSteps((prev) => {
                                   const updated = [...prev];
                                   if (updated[idx].ingredients) {
                                      updated[idx].ingredients[ingIdx].amount = parseFloat(e.target.value) || 0;
                                   }
                                   return updated;
                                });
                             }}
                             className="w-16 text-center bg-white text-[#2C1D16] text-xs font-bold rounded-lg px-2 py-1.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                          />
                          <select
                             value={ing.unit}
                             onChange={(e) => {
                                setSteps((prev) => {
                                   const updated = [...prev];
                                   if (updated[idx].ingredients) {
                                      updated[idx].ingredients[ingIdx].unit = e.target.value as UnitType;
                                   }
                                   return updated;
                                });
                             }}
                             className="bg-white text-[#2C1D16] text-xs font-bold rounded-lg px-2 py-1.5 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                          >
                            {Object.entries(UNIT_LABELS).map(([key, label]) => (
                               <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <button
                             type="button"
                             onClick={() => {
                                setSteps((prev) => {
                                   const updated = [...prev];
                                   if (updated[idx].ingredients) {
                                      updated[idx].ingredients = updated[idx].ingredients.filter(i => i.id !== ing.id);
                                   }
                                   return updated;
                                });
                             }}
                             className="p-1.5 text-red-700 hover:text-red-900"
                          >
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                     ))}
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};
