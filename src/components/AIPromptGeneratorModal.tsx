import React, { useState } from 'react';
import { Bot, Copy, Check, X, Wand2 } from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface AIPromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPromptGeneratorModal: React.FC<AIPromptGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dishName, setDishName] = useState('');
  const [servings, setServings] = useState('4');
  const [comments, setComments] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const generatePrompt = () => {
    return `Привет, нейросеть! Напиши идеальный, подробный и структурированный рецепт для блюда: "${dishName}".
${comments ? `Пожелания к рецепту: ${comments}` : ''}
Укажи количество ингредиентов ровно на ${servings} порций.

Пожалуйста, выведи результат строго в таком формате, чтобы мой локальный парсер смог его идеально распознать:

${dishName}
[Вкусное и краткое описание блюда на пару предложений]
Порции: ${servings}

Ингредиенты:
- [Название ингредиента]: [Количество] [Единица измерения] (опционально, если по желанию) (или [альтернатива, если есть])
- [Название ингредиента]: [Количество] [Единица измерения]
(Выводи каждый ингредиент с новой строки, начиная с дефиса. Пример: "- Мука: 200 г")

Шаги:
1. [Подробное описание первого шага. Если процесс требует времени, обязательно напиши, например: "варить 15 минут".]
   Ингредиенты для шага (если нужны, выводи с новой строки под шагом с отступом):
     - [Название ингредиента]: [Количество] [Единица измерения] (опционально)
2. [Подробное описание второго шага].
   Ингредиенты для шага:
     - [Название ингредиента]: [Количество] [Единица измерения] (опционально)

Пожалуйста, не используй markdown-таблицы, сложный код или лишние комментарии. Только рецепт в указанном текстовом виде. Спасибо!`;
  };

  const handleCopy = async () => {
    try {
      triggerHaptic(40);
      const prompt = generatePrompt();
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      alert('Не удалось скопировать текст в буфер обмена.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-paper-warm notebook-page-shadow rounded-2xl border-2 border-[#D4AF37] overflow-hidden my-8 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#2D1B14] text-[#E6C875] p-4 border-b border-[#4A3226] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8A2BE2] to-[#4B0082] text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title text-lg font-bold text-[#E6C875]">
                Запрос к Нейросети
              </h3>
              <p className="text-[10px] text-amber-200/60 font-san-francisco">
                Генератор идеального промпта для ChatGPT, Claude и др.
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
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1 block">
                  Что будем готовить? (Название блюда)
                </label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Например: Паста Карбонара, Борщ..."
                  className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-sm font-bold font-serif-title rounded-xl p-3 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1 block">
                  Количество порций
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-sm font-bold font-serif-title rounded-xl p-3 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#3B2319] uppercase tracking-wider mb-1 block">
                Особые пожелания или диета (необязательно)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Например: Сделай рецепт вегетарианским, используй меньше сахара, готовь в мультиварке..."
                rows={3}
                className="w-full bg-[#FAF6EC] text-[#2C1D16] placeholder-[#A69585] text-xs font-san-francisco rounded-xl p-3 border border-[#C5BBAA] focus:outline-none focus:border-[#8C5828]"
              />
            </div>

            {/* Preview of the prompt */}
            <div className="bg-[#EFE8D8] p-4 rounded-xl border border-[#D4CEBE]">
              <h4 className="text-[10px] font-bold text-[#8C5828] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                Предпросмотр промпта:
              </h4>
              <p className="text-xs text-[#5C4532] whitespace-pre-wrap font-san-francisco italic max-h-40 overflow-y-auto pr-2">
                {generatePrompt()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EFE8D8] border-t border-[#D4CEBE] flex justify-end">
          <button
            onClick={handleCopy}
            disabled={!dishName.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] hover:opacity-90 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Скопировано!' : 'Копировать промпт'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
