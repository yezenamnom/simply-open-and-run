import { useState, useCallback } from "react";
import { perplexityApi, SearchResult } from "@/lib/api/perplexity";
import { SearchHistoryItem } from "@/components/search/SearchHistory";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { detectLanguage } from "@/lib/languageDetector";

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface SearchState {
  id: string;
  query: string;
  type: 'general' | 'news' | 'lesson' | 'smart';
  result: SearchResult | null;
  isLoading: boolean;
  images: string[];
  chatId?: string; // ربط الرسائل بنفس المحادثة
}

export const usePerplexitySearch = () => {
  const [searches, setSearches] = useState<Map<string, SearchState>>(new Map());
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [lessonMode, setLessonMode] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const currentSearch = currentSearchId ? searches.get(currentSearchId) : null;
  
  // جميع رسائل المحادثة الحالية (مرتبطة بنفس chatId)
  // نستخدم Map للحفاظ على ترتيب الإضافة (FIFO)
  const chatMessages = chatId 
    ? Array.from(searches.values())
        .filter(s => s.chatId === chatId)
        .sort((a, b) => {
          // ترتيب حسب ترتيب الإضافة (نستخدم index في Map)
          const aIndex = Array.from(searches.keys()).indexOf(a.id);
          const bIndex = Array.from(searches.keys()).indexOf(b.id);
          return aIndex - bIndex;
        })
    : currentSearch ? [currentSearch] : [];

  const runSearch = useCallback(async (id: string, query: string, type: 'general' | 'news' | 'smart', images: string[] = [], addToHistory: boolean, chatIdParam?: string) => {
    const actualType = lessonMode ? 'lesson' : type;

    const newSearch: SearchState = {
      id,
      query,
      type: actualType as any,
      result: null,
      isLoading: true,
      images,
      chatId: chatIdParam, // ربط الرسالة بالمحادثة
    };

    setSearches(prev => new Map(prev).set(id, newSearch));
    setCurrentSearchId(id);

    if (addToHistory) {
      setHistory(prev => [{
        id,
        query,
        type: actualType as any,
        timestamp: new Date(),
      }, ...prev]);
    }

    try {
      // كشف لغة الرسالة المرسلة بدلاً من لغة الموقع
      const detectedLanguage = detectLanguage(query);
      const result = await perplexityApi.search(query, actualType as any, detectedLanguage);
      
      setSearches(prev => {
        const updated = new Map(prev);
        const existing = updated.get(id);
        if (existing) {
          updated.set(id, { ...existing, result, isLoading: false });
        }
        return updated;
      });

      if (!result.success) {
        toast({
          title: language === 'ar' ? 'خطأ في البحث' : language === 'de' ? 'Suchfehler' : 'Search Error',
          description: result.error || (language === 'ar' ? 'حدث خطأ أثناء البحث' : 'An error occurred'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearches(prev => {
        const updated = new Map(prev);
        const existing = updated.get(id);
        if (existing) {
          updated.set(id, {
            ...existing,
            result: { success: false, error: language === 'ar' ? 'فشل الاتصال بالخادم' : 'Connection failed' },
            isLoading: false,
          });
        }
        return updated;
      });
      toast({
        title: language === 'ar' ? 'خطأ في الاتصال' : language === 'de' ? 'Verbindungsfehler' : 'Connection Error',
        description: language === 'ar' ? 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your internet connection',
        variant: "destructive",
      });
    }
  }, [toast, language, lessonMode]);

  const search = useCallback(async (query: string, type: 'general' | 'news' | 'smart', images: string[] = []) => {
    const id = generateId();
    await runSearch(id, query, type, images, true);
  }, [runSearch]);

  const chat = useCallback(async (query: string, type: 'general' | 'news' | 'smart', images: string[] = []) => {
    const currentChatId = chatId ?? generateId();
    if (!chatId) {
      setChatId(currentChatId);
    }
    // إنشاء id فريد لكل رسالة، لكن نربطها بنفس chatId
    const messageId = generateId();
    await runSearch(messageId, query, type, images, false, currentChatId);
  }, [chatId, runSearch]);

  const selectSearch = useCallback((id: string) => {
    setCurrentSearchId(id);
  }, []);

  const deleteSearch = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    setSearches(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
    if (currentSearchId === id) {
      setCurrentSearchId(null);
    }
  }, [currentSearchId]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSearches(new Map());
    setCurrentSearchId(null);
    setChatId(null);
  }, []);

  const goHome = useCallback(() => {
    setCurrentSearchId(null);
    setChatId(null);
  }, []);

  const toggleLessonMode = useCallback(() => {
    setLessonMode(prev => !prev);
  }, []);

  return {
    currentSearch,
    chatMessages, // جميع رسائل المحادثة الحالية
    history,
    currentSearchId,
    search,
    chat,
    selectSearch,
    deleteSearch,
    clearHistory,
    goHome,
    lessonMode,
    toggleLessonMode,
  };
};
