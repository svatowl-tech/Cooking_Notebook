export type UnitType = 'g' | 'ml' | 'pcs' | 'tbsp' | 'tsp' | 'pinch' | 'to_taste';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: UnitType;
  substitutes?: string[]; // Возможные замены
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  timerDurationSeconds?: number; // Автоматически распознанное время в секундах
  photoBase64?: string;          // Фото этапа готовки
  tips?: string;                 // Пояснения/лайфхаки к шагу
  ingredients?: Ingredient[];    // Ингредиенты для данного конкретного шага
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  coverPhotoBase64?: string;
  category: string;
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}

export interface BackupSnapshot {
  timestamp: number;
  recipeCount: number;
  dataJson: string;
}

export const CATEGORIES = [
  'Все рецепты',
  'Закуски',
  'Супы',
  'Горячее',
  'Выпечка',
  'Десерты',
  'Напитки',
  'Соусы',
  'Заготовки',
  'Избранное'
] as const;

export type CategoryType = typeof CATEGORIES[number];

export const UNIT_LABELS: Record<UnitType, string> = {
  g: 'г',
  ml: 'мл',
  pcs: 'шт',
  tbsp: 'ст. л.',
  tsp: 'ч. л.',
  pinch: 'щепотка',
  to_taste: 'по вкусу'
};
