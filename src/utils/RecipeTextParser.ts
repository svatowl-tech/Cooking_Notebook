import { Ingredient, RecipeStep, UnitType } from '../types';

export interface ParsedRecipeResult {
  title: string;
  description?: string;
  category: string;
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

/**
 * Deterministic Recipe Text Parser using regex and heuristics.
 * Works 100% offline without external AI APIs.
 */
export class RecipeTextParser {
  /**
   * Parses arbitrary unstructured text into a structured Recipe object
   */
  public static parse(rawText: string): ParsedRecipeResult {
    const cleanText = rawText.replace(/\r\n/g, '\n').trim();
    const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

    if (lines.length === 0) {
      return {
        title: 'Новый рецепт',
        category: 'Горячее',
        servings: 4,
        ingredients: [],
        steps: [],
      };
    }

    // 1. Title & Description Extraction
    let title = 'Рецепт из буфера';
    let description = '';
    let category = 'Горячее';
    let servings = 4;

    const ingHeaderRegex = /^(ингредиенты|состав|потребуется|продукты|что\s+нужно|ingredients|composition|компоненты)/i;
    const stepHeaderRegex = /^(приготовление|шаги|пошаговое\s+приготовление|процесс|как\s+готовить|инструкция|steps|preparation|method)/i;

    // First line is usually title, unless it's a section header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!ingHeaderRegex.test(line) && !stepHeaderRegex.test(line)) {
        // Strip markdown headers like # or **
        title = line.replace(/^[#*–—\s]+/, '').replace(/[*#]/g, '').trim();
        if (lines[i + 1] && !ingHeaderRegex.test(lines[i + 1]) && lines[i + 1].length > 15 && lines[i + 1].length < 120) {
          description = lines[i + 1].replace(/[*#]/g, '').trim();
        }
        break;
      }
    }

    // Category detector heuristics
    const lowerAll = cleanText.toLowerCase();
    if (/\b(суп|борщ|щи|солянка|уха|бульон|рассольник|харчо|soup)\b/i.test(lowerAll)) {
      category = 'Супы';
    } else if (/\b(салат|закуска|паштет|канапе|бутерброд|нарезка|tartare|salad)\b/i.test(lowerAll)) {
      category = 'Закуски';
    } else if (/\b(пирог|торт|кекс|печенье|булочк|хлеб|блины|оладьи|тесто|пицца|выпечка|baking|cake)\b/i.test(lowerAll)) {
      category = 'Выпечка';
    } else if (/\b(десерт|мороженое|мусс|крем|пудинг|желе|dessert|pudding)\b/i.test(lowerAll)) {
      category = 'Десерты';
    } else if (/\b(соус|заправка|майонез|кетчуп|подлива|sauce)\b/i.test(lowerAll)) {
      category = 'Соусы';
    } else if (/\b(напиток|коктейль|компот|морс|смузи|чай|кофе|drink|smoothie)\b/i.test(lowerAll)) {
      category = 'Напитки';
    } else if (/\b(варенье|джем|заготовка|консервация|маринад|закрутка)\b/i.test(lowerAll)) {
      category = 'Заготовки';
    }

    // Servings detector
    const servingsMatch = lowerAll.match(/(\d+)\s*(порци|порций|порция|порции|порциям|servings|persons)/i);
    if (servingsMatch) {
      servings = parseInt(servingsMatch[1], 10) || 4;
    }

    // 2. Ingredients Block Isolation & Line Parsing
    const rawIngredientsLines: string[] = [];
    const rawStepsLines: string[] = [];

    let currentSection: 'header' | 'ingredients' | 'steps' = 'header';

    for (const line of lines) {
      if (ingHeaderRegex.test(line)) {
        currentSection = 'ingredients';
        continue;
      } else if (stepHeaderRegex.test(line)) {
        currentSection = 'steps';
        continue;
      }

      if (currentSection === 'header') {
        // Check if line looks like an ingredient (e.g. "- Мука: 200г" or "• 2 яйца")
        if (/^[-•*]?\s*[А-Яа-яA-Za-z\s]+[:—–-]?\s*\d+/i.test(line) || /\d+\s*(г|гр|мл|шт|ст\.?\s*л|ч\.?\s*л|кг|л)\b/i.test(line)) {
          rawIngredientsLines.push(line);
        } else if (/^\d+[\.\)]\s+/.test(line) || /^(шаг|step)\s*\d+/i.test(line)) {
          currentSection = 'steps';
          rawStepsLines.push(line);
        }
      } else if (currentSection === 'ingredients') {
        // If we hit a line that looks like a step ("1. Смешать...", "Шаг 1:"), switch to steps
        if (/^\d+[\.\)]\s+[А-Яа-яA-Za-z]/.test(line) || /^(шаг|step)\s*\d+/i.test(line)) {
          currentSection = 'steps';
          rawStepsLines.push(line);
        } else {
          rawIngredientsLines.push(line);
        }
      } else if (currentSection === 'steps') {
        rawStepsLines.push(line);
      }
    }

    // Fallback: if section headers weren't found, categorize lines by format
    if (rawIngredientsLines.length === 0 && rawStepsLines.length === 0) {
      lines.forEach((line) => {
        if (/^\d+[\.\)]\s+/.test(line) || /^(шаг|step)/i.test(line) || line.length > 70) {
          rawStepsLines.push(line);
        } else if (/\d+/.test(line) || line.startsWith('-') || line.startsWith('•')) {
          rawIngredientsLines.push(line);
        } else {
          rawStepsLines.push(line);
        }
      });
    }

    // Process ingredients lines into structured Ingredient[]
    const ingredients: Ingredient[] = rawIngredientsLines
      .map((line, idx) => RecipeTextParser.parseIngredientLine(line, idx))
      .filter((ing): ing is Ingredient => ing !== null);

    // Process steps lines into structured RecipeStep[]
    const steps: RecipeStep[] = RecipeTextParser.parseStepLines(rawStepsLines);

    return {
      title,
      description,
      category,
      servings,
      ingredients,
      steps,
    };
  }

  /**
   * Parses a single ingredient line into structured format, handling units and substitute alternatives
   */
  public static parseIngredientLine(line: string, index: number): Ingredient | null {
    let clean = line.replace(/^[•*–—\s\d+\.\)]+/, '').trim();
    if (!clean || clean.length < 2) return null;

    // Check for optional flag
    let isOptional = false;
    const optionalRegex = /\((?:опционально|по\s+желанию)\)|опционально|по\s+желанию/i;
    if (optionalRegex.test(clean)) {
      isOptional = true;
      clean = clean.replace(optionalRegex, '').trim();
    }

    // Check for substitutes (e.g. "или 100г сметаны", "(можно заменить на рикотту)", "/ йогурт")
    let substitutes: string[] = [];
    const substituteRegex = /(?:или|можно\s+заменить\s+на|взамен|либо|\/)\s*([^,;\)\(\n]+)/i;
    const subMatch = clean.match(substituteRegex);
    if (subMatch) {
      substitutes.push(subMatch[1].trim());
      clean = clean.replace(substituteRegex, '').trim();
    }

    // Match numbers (including decimals, fractions like 1/2, ranges like 2-3)
    let amount = 1;
    let unit: UnitType = 'pcs';

    // Fraction check
    const fractionMatch = clean.match(/(\d+)\s*\/\s*(\d+)/);
    if (fractionMatch) {
      amount = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
      clean = clean.replace(/(\d+)\s*\/\s*(\d+)/, '').trim();
    } else {
      const numMatch = clean.match(/(\d+(?:[\.,]\d+)?)/);
      if (numMatch) {
        amount = parseFloat(numMatch[1].replace(',', '.'));
      }
    }

    // Unit detection regex heuristics
    const lower = clean.toLowerCase();
    if (/\b(г|гр|g|грамм|грамма|граммов)\b/i.test(lower)) {
      unit = 'g';
    } else if (/\b(мл|ml|миллилитр|миллилитров)\b/i.test(lower)) {
      unit = 'ml';
    } else if (/\b(л|l|литр|литра|литров)\b/i.test(lower)) {
      unit = 'ml';
      amount = amount * 1000; // Convert liters to ml
    } else if (/\b(кг|kg|килограмм|килограмма)\b/i.test(lower)) {
      unit = 'g';
      amount = amount * 1000; // Convert kg to grams
    } else if (/\b(ст\.?\s*л\.?|столов(ая|ые)\s*ложк(а|и|у|ами)|tbsp)\b/i.test(lower)) {
      unit = 'tbsp';
    } else if (/\b(ч\.?\s*л\.?|чайн(ая|ые)\s*ложк(а|и|у|ами)|tsp)\b/i.test(lower)) {
      unit = 'tsp';
    } else if (/\b(щепотк(а|и|у)|pinch)\b/i.test(lower)) {
      unit = 'pinch';
    } else if (/по\s+вкусу|to\s+taste/i.test(lower)) {
      unit = 'to_taste';
      amount = 0;
    } else if (/\b(стакан|стакана|стаканов|скл|cup)\b/i.test(lower)) {
      unit = 'ml';
      amount = amount * 200; // 1 glass standard ~ 200 ml
    } else if (/\b(шт|pcs|штук|штука|головк(а|и)|зубчик(а|ов)?|пачк(а|и)|упаковк(а|и))\b/i.test(lower)) {
      unit = 'pcs';
    }

    // Extract clean name by removing amount and unit strings
    let name = clean
      .replace(/(\d+(?:[\.,]\d+)?)/g, '')
      .replace(/\b(г|гр|g|грамм|грамма|граммов|мл|ml|миллилитр|л|l|литр|кг|kg|ст\.?\s*л\.?|столовая|чайная|ч\.?\s*л\.?|щепотка|по вкусу|стакан|шт|pcs|штук|зубчик|головка)\b/gi, '')
      .replace(/[:\-–—,\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name) name = clean;

    return {
      id: `ing_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: isNaN(amount) ? 1 : amount,
      unit,
      substitutes: substitutes.length > 0 ? substitutes : undefined,
      isOptional: isOptional ? true : undefined,
    };
  }

  /**
   * Processes step lines and auto-detects cooking timers in step text,
   * as well as nested ingredients for the step.
   */
  public static parseStepLines(rawSteps: string[]): RecipeStep[] {
    const steps: RecipeStep[] = [];
    let currentStep: RecipeStep | null = null;
    let stepCount = 1;

    for (const rawLine of rawSteps) {
      let clean = rawLine.trim();
      if (!clean) continue;

      // Detect if this line is an ingredient for the current step (starts with -, •, * or is indented heavily after a step)
      if (currentStep && (clean.startsWith('-') || clean.startsWith('•') || clean.startsWith('*') || /ингредиент/i.test(clean))) {
        // Try parsing as ingredient
        if (!/ингредиент/i.test(clean)) {
            const ing = RecipeTextParser.parseIngredientLine(clean, currentStep.ingredients?.length || 0);
            if (ing) {
                if (!currentStep.ingredients) currentStep.ingredients = [];
                currentStep.ingredients.push(ing);
            }
        }
        continue;
      }

      clean = clean.replace(/^(шаг\s*\d+:?|\d+[\.\)]|-|•|\*)\s*/i, '').trim();
      if (!clean) continue;

      // Detect timer regex: e.g. "варить 15 минут", "выпекать 45 мин", "тушить 1.5 часа", "10-15 минут"
      const timerDurationSeconds = RecipeTextParser.extractTimerSeconds(clean);

      currentStep = {
        id: `step_${Date.now()}_${stepCount}_${Math.random().toString(36).substring(2, 6)}`,
        stepNumber: stepCount,
        instruction: clean,
        timerDurationSeconds: timerDurationSeconds > 0 ? timerDurationSeconds : undefined,
        ingredients: []
      };
      steps.push(currentStep);

      stepCount++;
    }

    return steps;
  }

  /**
   * Scans text for time expressions and converts them to duration in seconds
   */
  public static extractTimerSeconds(text: string): number {
    const timeRegex = /(\d+(?:[\.,]\d+)?)\s*(?:[-–—]\s*\d+\s*)?(секунд[ыа]?|сек|sec|минут[ыа]?|мин|mins?|часа?|часов|ч|hours?|hrs?)\b/gi;
    let match: RegExpExecArray | null;
    let totalSeconds = 0;

    while ((match = timeRegex.exec(text)) !== null) {
      const value = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toLowerCase();

      if (/сек|sec/i.test(unit)) {
        totalSeconds += value;
      } else if (/мин|min/i.test(unit)) {
        totalSeconds += value * 60;
      } else if (/час|ч|hour|hr/i.test(unit)) {
        totalSeconds += value * 3600;
      }
    }

    return Math.round(totalSeconds);
  }
}
