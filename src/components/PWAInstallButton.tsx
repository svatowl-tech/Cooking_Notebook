import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'settings' | 'compact' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, hide button in header
  if (isInstalled && variant !== 'settings') {
    return null;
  }

  const handleClick = async () => {
    playClickSound();
    triggerHaptic(30);

    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Установить приложение на телефон или компьютер"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-900/90 hover:from-amber-600 hover:to-amber-800 text-[#FCE788] border border-[#D4AF37]/50 shadow-md text-xs font-semibold active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5 text-[#FCE788]" />
          <span className="hidden sm:inline">Установить PWA</span>
          <span className="sm:hidden">PWA</span>
        </button>
      )}

      {variant === 'settings' && (
        <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#DECBB3] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#8C5828]" />
              <div>
                <h4 className="font-bold text-sm text-[#2C1D16]">
                  Установка PWA приложения
                </h4>
                <p className="text-[11px] text-[#7A614E] font-san-francisco">
                  {isInstalled
                    ? 'Приложение уже установлено на ваше устройство.'
                    : 'Работает автономно без интернета прямо с экрана «Домой».'}
                </p>
              </div>
            </div>
            {!isInstalled && (
              <button
                onClick={handleClick}
                className="px-3 py-1.5 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Установить</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guided Modal for iOS Safari / Desktop Manual Install */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#FAF6EC] border-2 border-[#D4AF37] p-5 shadow-2xl text-[#2C1D16] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DECBB3] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#8C5828]" />
                <h3 className="font-serif-title text-base font-bold">
                  Установка на устройство
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg hover:bg-[#EAE4D6] text-[#6B4B35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs leading-relaxed font-san-francisco">
                <p className="font-medium text-[#2C1D16]">
                  Чтобы установить Кулинарный Блокнот на iPhone или iPad:
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#DECBB3] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5828] bg-[#F4EBD9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <p className="flex items-center gap-1 flex-wrap">
                      В браузере Safari нажмите кнопку <Share2 className="w-3.5 h-3.5 inline text-[#4285F4]" /> <strong>«Поделиться»</strong> (в нижней панели).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5828] bg-[#F4EBD9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <p className="flex items-center gap-1 flex-wrap">
                      Прокрутите вниз и нажмите <PlusSquare className="w-3.5 h-3.5 inline text-[#8C5828]" /> <strong>«На экран Домой»</strong> (Add to Home Screen).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#8C5828] bg-[#F4EBD9] w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                    <p>
                      Нажмите <strong>«Добавить»</strong>. Иконка блокнота появится на рабочем столе и будет открываться на весь экран без рамок браузера!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed font-san-francisco">
                <p className="font-medium text-[#2C1D16]">
                  Для Android и ПК (Google Chrome, Edge, Яндекс):
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#DECBB3] space-y-2">
                  <p>
                    1. Нажмите иконку <strong>«Установить приложение»</strong> в адресной строке браузера (или в меню браузера ⋮ выберите <strong>«Установить приложение»</strong>).
                  </p>
                  <p>
                    2. Подтвердите установку. Блокнот будет работать независимо и автономно!
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#4A3226] hover:bg-[#5C3E30] text-[#E6C875] text-xs font-bold transition shadow-sm"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
