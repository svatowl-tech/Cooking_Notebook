import React, { useState } from 'react';
import { Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleDriveSyncProps {
  onExportJSON: () => Promise<string>;
  onImportJSON: (jsonText: string, mode: 'merge' | 'overwrite') => Promise<{ success: boolean; importedCount: number; message: string }>;
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ onExportJSON, onImportJSON }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const syncToDrive = async (accessToken: string) => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const jsonData = await onExportJSON();
      const fileContent = new Blob([jsonData], { type: 'application/json' });
      const metadata = {
        name: 'CulinaryNotebook_Backup.json',
        mimeType: 'application/json',
        parents: ['appDataFolder'] // Store in app-specific hidden folder
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileContent);

      // Search for existing file
      const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="CulinaryNotebook_Backup.json"', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();
      const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

      let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (existingFile) {
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
        method = 'PATCH';
      }

      const res = await fetch(uploadUrl, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (!res.ok) throw new Error('Upload failed');
      setSyncStatus({ type: 'success', msg: 'Синхронизация с Google Drive успешно завершена.' });
    } catch (err) {
      console.error(err);
      setSyncStatus({ type: 'error', msg: 'Ошибка при сохранении в Google Drive.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => syncToDrive(codeResponse.access_token),
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    onError: (error) => setSyncStatus({ type: 'error', msg: 'Ошибка авторизации Google.' })
  });

  if (!googleClientId) {
    return (
      <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-gray-500" />
          <div>
            <h4 className="font-bold text-sm text-[#2C1D16]">
              Синхронизация Google Drive
            </h4>
            <p className="text-[11px] text-gray-500 font-san-francisco leading-snug mt-1">
              Для включения этой функции необходимо настроить OAuth Client ID в Google Cloud Console и прописать его в файл <code>.env.example</code> (VITE_GOOGLE_CLIENT_ID).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="w-5 h-5 text-[#4285F4]" />
        <div>
          <h4 className="font-bold text-sm text-[#2C1D16]">
            Синхронизация Google Drive
          </h4>
          <p className="text-[11px] text-[#7A614E] font-san-francisco">
            Сохранить резервную копию блокнота в скрытую папку приложения на Google Drive.
          </p>
        </div>
      </div>

      <button
        onClick={() => login()}
        disabled={isSyncing}
        className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
        <span>Сохранить в Google Drive</span>
      </button>

      {syncStatus && (
        <div className={`text-xs mt-2 flex items-center gap-1 ${syncStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {syncStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{syncStatus.msg}</span>
        </div>
      )}
    </div>
  );
};
