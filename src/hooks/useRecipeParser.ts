import { useState, useCallback } from 'react';
import { RecipeTextParser, ParsedRecipeResult } from '../utils/RecipeTextParser';

export function useRecipeParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedRecipeResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseText = useCallback((text: string): ParsedRecipeResult | null => {
    setIsParsing(true);
    setParseError(null);
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Текст для распознавания пуст');
      }
      const result = RecipeTextParser.parse(text);
      setParsedResult(result);
      setIsParsing(false);
      return result;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Не удалось распознать рецепт';
      setParseError(errMsg);
      setIsParsing(false);
      return null;
    }
  }, []);

  const resetParser = useCallback(() => {
    setParsedResult(null);
    setParseError(null);
    setIsParsing(false);
  }, []);

  return {
    isParsing,
    parsedResult,
    parseError,
    parseText,
    resetParser,
  };
}
