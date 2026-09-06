import React, { useState, useEffect } from 'react';
import { X, Volume2, BellRing, Music, SmartphoneNfc } from 'lucide-react';
import { triggerHaptic, playClickSound, playTimerCompletionSound, AlarmSoundType } from '../utils/audioSynth';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmSoundType>('chime');

  useEffect(() => {
    const saved = localStorage.getItem('notebook_alarm_sound') as AlarmSoundType;
    if (saved) {
      setSelectedAlarm(saved);
    }
  }, []);

  const handleSelectSound = (type: AlarmSoundType) => {
    triggerHaptic(20);
    setSelectedAlarm(type);
    localStorage.setItem('notebook_alarm_sound', type);
    // Play a preview of the sound
    playTimerCompletionSound(type);
  };

  const alarms: { id: AlarmSoundType; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'chime', label: 'Классический', desc: 'Двойной кухонный звоночек', icon: <BellRing className="w-5 h-5" /> },
    { id: 'digital', label: 'Цифровой', desc: 'Резкий писк электронных часов', icon: <SmartphoneNfc className="w-5 h-5" /> },
    { id: 'bell', label: 'Колокол', desc: 'Глубокий звон колокольчика', icon: <BellRing className="w-5 h-5" /> },
    { id: 'gentle', label: 'Спокойный', desc: 'Мягкий аккорд маримбы', icon: <Music className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-paper-warm notebook-page-shadow rounded-2xl border border-[#D4CEBE] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#C5BBAA] bg-[#EAE2D0]">
          <h2 className="font-serif-title text-xl font-bold text-[#2C1D16]">Настройки</h2>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#D4CEBE] text-[#6B4B35] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#8C5828] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              Звук таймера
            </h3>
            <p className="text-xs text-[#6B4B35] leading-relaxed pb-2">
              Выберите сигнал, который будет звучать по окончании таймера. <br/>
              <strong>Важно:</strong> Не закрывайте вкладку во время готовки. Сигнал сработает даже при заблокированном экране!
            </p>

            <div className="space-y-2">
              {alarms.map((alarm) => (
                <button
                  key={alarm.id}
                  onClick={() => handleSelectSound(alarm.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    selectedAlarm === alarm.id
                      ? 'bg-[#EAE4D6] border-[#8C5828] shadow-sm'
                      : 'bg-white/50 border-[#D4CEBE] hover:bg-[#F3EEDF]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedAlarm === alarm.id ? 'bg-[#8C5828] text-white' : 'bg-[#E2D8C3] text-[#6B4B35]'}`}>
                    {alarm.icon}
                  </div>
                  <div>
                    <div className={`font-bold ${selectedAlarm === alarm.id ? 'text-[#2C1D16]' : 'text-[#6B4B35]'}`}>
                      {alarm.label}
                    </div>
                    <div className="text-[10px] text-[#8C705A]">{alarm.desc}</div>
                  </div>
                  {selectedAlarm === alarm.id && (
                    <div className="ml-auto w-3 h-3 rounded-full bg-[#8C5828]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
