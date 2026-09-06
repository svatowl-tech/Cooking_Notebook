import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useState } from 'react';
import { db } from '../db/recipeDb';
import { Recipe, BackupSnapshot } from '../types';
import { SEED_RECIPES } from '../db/seedData';

export function useRecipeDB() {
  const [dbError, setDbError] = useState<string | null>(null);

  // Live reactive Dexie query for all recipes, sorted by updatedAt
  const recipes = useLiveQuery(
    () => db.recipes.orderBy('updatedAt').reverse().toArray(),
    [],
    [] as Recipe[]
  );

  // Live reactive query for backups
  const backups = useLiveQuery(
    () => db.backups.orderBy('timestamp').reverse().toArray(),
    [],
    [] as BackupSnapshot[]
  );

  const addRecipe = useCallback(async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    setDbError(null);
    try {
      const now = Date.now();
      const newRecipe: Recipe = {
        ...recipeData,
        id: `rec_${now}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };

      await db.recipes.add(newRecipe);
      await db.createAutoBackupSnapshot();
      return newRecipe.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении рецепта';
      setDbError(msg);
      throw err;
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, updates: Partial<Recipe>): Promise<void> => {
    setDbError(null);
    try {
      const existing = await db.recipes.get(id);
      if (!existing) throw new Error('Рецепт не найден');

      const updatedRecipe: Recipe = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      await db.recipes.put(updatedRecipe);
      await db.createAutoBackupSnapshot();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка при обновлении рецепта';
      setDbError(msg);
      throw err;
    }
  }, []);

  const deleteRecipe = useCallback(async (id: string): Promise<void> => {
    setDbError(null);
    try {
      await db.recipes.delete(id);
      await db.createAutoBackupSnapshot();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка при удалении рецепта';
      setDbError(msg);
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    try {
      const recipe = await db.recipes.get(id);
      if (recipe) {
        await db.recipes.update(id, {
          isFavorite: !recipe.isFavorite,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, []);

  const exportJSON = useCallback(async (): Promise<string> => {
    const all = await db.recipes.toArray();
    return JSON.stringify({
      app: 'CulinaryNotebook',
      version: 1,
      exportedAt: new Date().toISOString(),
      recipeCount: all.length,
      recipes: all
    }, null, 2);
  }, []);

  const importJSON = useCallback(async (jsonText: string, mode: 'merge' | 'overwrite' = 'merge'): Promise<{ success: boolean; importedCount: number; message: string }> => {
    setDbError(null);
    try {
      const parsed = JSON.parse(jsonText);
      let listToImport: Recipe[] = [];

      if (Array.isArray(parsed)) {
        listToImport = parsed;
      } else if (parsed && Array.isArray(parsed.recipes)) {
        listToImport = parsed.recipes;
      } else {
        throw new Error('Некорректная структура файла JSON. Ожидается массив рецептов.');
      }

      // Schema validation
      const validRecipes: Recipe[] = listToImport.filter((r) => {
        return r && typeof r.title === 'string' && Array.isArray(r.ingredients) && Array.isArray(r.steps);
      }).map((r) => ({
        ...r,
        id: r.id || `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: r.category || 'Горячее',
        servings: typeof r.servings === 'number' ? r.servings : 4,
        createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
        updatedAt: Date.now(),
      }));

      if (validRecipes.length === 0) {
        throw new Error('Файл не содержит допустимых рецептов');
      }

      if (mode === 'overwrite') {
        await db.recipes.clear();
      }

      await db.recipes.bulkPut(validRecipes);
      await db.createAutoBackupSnapshot();

      return {
        success: true,
        importedCount: validRecipes.length,
        message: `Успешно импортировано рецептов: ${validRecipes.length}`
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка при импорте базы данных';
      setDbError(msg);
      return { success: false, importedCount: 0, message: msg };
    }
  }, []);

  const restoreFromBackupSnapshot = useCallback(async (snapshot: BackupSnapshot): Promise<void> => {
    await importJSON(snapshot.dataJson, 'overwrite');
  }, [importJSON]);

  const resetToSeedData = useCallback(async (): Promise<void> => {
    await db.recipes.clear();
    await db.recipes.bulkAdd(SEED_RECIPES);
    await db.createAutoBackupSnapshot();
    // Force a page reload to ensure all state (timers, current view, etc) is completely reset along with the data
    window.location.reload();
  }, []);

  return {
    recipes: recipes || [],
    backups: backups || [],
    dbError,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    exportJSON,
    importJSON,
    restoreFromBackupSnapshot,
    resetToSeedData,
  };
}
