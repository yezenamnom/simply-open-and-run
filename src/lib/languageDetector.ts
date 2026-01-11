/**
 * كشف لغة النص المرسل
 * @param text النص المراد كشف لغته
 * @returns 'ar' | 'en' | 'de'
 */
export const detectLanguage = (text: string): 'ar' | 'en' | 'de' => {
  if (!text || text.trim().length === 0) {
    return 'en'; // افتراضي
  }

  // كشف الأحرف العربية
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(text)) {
    return 'ar';
  }

  // كشف الأحرف الألمانية (مثل ä, ö, ü, ß)
  const germanChars = /[äöüßÄÖÜ]/;
  const germanWords = /\b(der|die|das|und|oder|ist|sind|haben|sein|können|müssen|wollen|sollen|werden|haben|sein|gehen|kommen|machen|sehen|hören|sprechen|verstehen|wissen|denken|glauben|hoffen|fürchten|lieben|hassen|mögen|wollen|dürfen|sollen|müssen|können)\b/i;
  
  if (germanChars.test(text) || germanWords.test(text)) {
    return 'de';
  }

  // افتراضي: إنجليزي
  return 'en';
};

