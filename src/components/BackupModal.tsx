import React, { useState } from 'react';
import { BackupSnapshot } from '../types';
import { HardDriveDownload, Download, Upload, RotateCcw, X, ShieldCheck, AlertCircle, Trash2, Database } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';
import { GoogleDriveSync } from './GoogleDriveSync';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJSON: () => Promise<string>;
  onImportJSON: (jsonText: string, mode: 'merge' | 'overwrite') => Promise<{ success: boolean; importedCount: number; message: string }>;
  backups: BackupSnapshot[];
  onRestoreBackup: (snapshot: BackupSnapshot) => Promise<void>;
  onResetToSeed: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onExportJSON,
  onImportJSON,
  backups,
  onRestoreBackup,
  onResetToSeed,
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  // Handle Export File Download
  const handleDownloadBackup = async () => {
    try {
      triggerHaptic(30);
      const jsonStr = await onExportJSON();
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Culinary_Notebook_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage('Файл бэкапа успешно создан и загружен!');
      setIsError(false);
    } catch (err) {
      setStatusMessage('Ошибка при создании файла бэкапа.');
      setIsError(true);
    }
  };

  // Handle Import File Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        triggerHaptic(40);
        const text = event.target?.result as string;
        const res = await onImportJSON(text, importMode);
        setStatusMessage(res.message);
        setIsError(!res.success);
      } catch (err) {
        setStatusMessage('Не удалось прочитать файл бэкапа.');
        setIsError(true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-paper-warm notebook-page-shadow rounded-2xl border-2 border-[#D4AF37] overflow-hidden my-8 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#2D1B14] text-[#E6C875] p-4 border-b border-[#4A3226] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif-title text-lg font-bold">
                Безопасность и бэкап данных
              </h3>
              <p className="text-[10px] text-amber-200/60 font-san-francisco">
                IndexedDB Хранилище • Выгрузка в .JSON
              </p>
            </div>
          </div>

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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[85vh]">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                isError
                  ? 'bg-red-950/80 border border-red-500/50 text-red-200'
                  : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
              }`}
            >
              {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 1: Export JSON File */}
          <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#8C5828]" />
              <div>
                <h4 className="font-bold text-sm text-[#2C1D16]">
                  Скачать резервную копию (JSON)
                </h4>
                <p className="text-[11px] text-[#7A614E] font-san-francisco">
                  Сохраните файл всех рецептов с фотографиями в папку «Файлы» iOS или на диск.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Выгрузить всю базу рецептов в .json</span>
            </button>
          </div>

          <GoogleDriveSync onExportJSON={onExportJSON} onImportJSON={onImportJSON} />

          {/* Section 2: Import JSON File */}
          <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#8C5828]" />
              <div>
                <h4 className="font-bold text-sm text-[#2C1D16]">
                  Восстановить / Импортировать файл
                </h4>
                <p className="text-[11px] text-[#7A614E] font-san-francisco">
                  Загрузите ранее экспортированный файл .json с проверкой схемы.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#2C1D16]">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[#8C5828]"
                />
                Объединить
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#2C1D16]">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                  className="accent-[#8C5828]"
                />
                Перезаписать базу
              </label>
            </div>

            <label className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E6C875] text-[#2A1C15] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Выбрать файл .json для загрузки</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Section 3: Automatic Snapshots History */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#3B2319] uppercase tracking-wider">
              Автоматические снимки базы ({backups.length})
            </h4>

            {backups.length === 0 ? (
              <p className="text-xs text-[#8C705A] italic">Снимки автобэкапа пока не созданы.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {backups.map((snap) => (
                  <div
                    key={snap.timestamp}
                    className="p-2.5 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#2C1D16] block">
                        Снимок от {new Date(snap.timestamp).toLocaleString('ru-RU')}
                      </span>
                      <span className="text-[10px] text-[#7A614E]">
                        Рецептов: {snap.recipeCount}
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        if (window.confirm('Восстановить базу данных из этого снимка?')) {
                          triggerHaptic(40);
                          await onRestoreBackup(snap);
                          setStatusMessage('База успешно восстановлена из снимка!');
                          setIsError(false);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-[#8C5828] hover:bg-[#73471E] text-amber-50 font-bold text-[11px] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Восстановить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Reset to Starter Seed Data */}
          <div className="pt-4 border-t border-[#DECBB3] flex items-center justify-between">
            <span className="text-xs text-[#8C705A]">
              Вернуть демонстрационные рецепты
            </span>
            <button
              onClick={async () => {
                if (window.confirm('Сбросить базу и загрузить начальные рецепты?')) {
                  triggerHaptic(50);
                  await onResetToSeed();
                  setStatusMessage('База сброшена к начальным рецептам.');
                  setIsError(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 text-xs font-bold"
            >
              Сброс к демо-базе
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
