import Dexie, { Table } from 'dexie';
import { Recipe, BackupSnapshot } from '../types';
import { SEED_RECIPES } from './seedData';

export class CulinaryNotebookDB extends Dexie {
  recipes!: Table<Recipe, string>;
  backups!: Table<BackupSnapshot, number>;

  constructor() {
    super('CulinaryNotebookDB');

    this.version(1).stores({
      recipes: 'id, title, category, isFavorite, createdAt, updatedAt',
      backups: 'timestamp'
    });
  }

  /**
   * Initializes database with seed data if empty
   */
  async initSeedDataIfNeeded(): Promise<void> {
    const count = await this.recipes.count();
    if (count === 0) {
      await this.recipes.bulkAdd(SEED_RECIPES);
      await this.createAutoBackupSnapshot();
    }
  }

  /**
   * Auto-backup snapshot generator stored in IndexedDB
   */
  async createAutoBackupSnapshot(): Promise<void> {
    try {
      const allRecipes = await this.recipes.toArray();
      const snapshot: BackupSnapshot = {
        timestamp: Date.now(),
        recipeCount: allRecipes.length,
        dataJson: JSON.stringify(allRecipes, null, 2),
      };

      await this.backups.put(snapshot);

      // Keep maximum 5 auto-backups to avoid unnecessary disk bloat
      const backupsList = await this.backups.orderBy('timestamp').reverse().toArray();
      if (backupsList.length > 5) {
        const toDelete = backupsList.slice(5);
        await this.backups.bulkDelete(toDelete.map((b) => b.timestamp));
      }
    } catch (err) {
      console.warn('Auto-backup snapshot creation failed:', err);
    }
  }
}

export const db = new CulinaryNotebookDB();
db.initSeedDataIfNeeded().catch(console.error);
