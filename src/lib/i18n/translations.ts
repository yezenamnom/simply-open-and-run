export type Language = 'ar' | 'en' | 'de';

export interface Translations {
  // Header & Navigation
  smartSearch: string;
  newSearch: string;
  darkMode: string;
  lightMode: string;
  
  // Hero Section
  heroTitle: string;
  heroDescription: string;
  
  // Search Input
  generalSearch: string;
  news: string;
  discover: string;
  smartAnswer: string;
  searchPlaceholder: string;
  newsPlaceholder: string;
  
  // Suggestions
  trySuggestions: string;
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  
  // Results
  searching: string;
  sources: string;
  answer: string;
  askAnother: string;
  
  // History
  history: string;
  clearAll: string;
  noHistory: string;
  noHistoryDesc: string;
  generalSearchType: string;
  newsType: string;
  now: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  
  // Discover Section
  trendingNews: string;
  loadingNews: string;
  noNewsAvailable: string;
  readMore: string;
  retry: string;

  // Lesson Mode
  lessonMode: string;
  saveLesson: string;
  savedLessons: string;
  noLessons: string;
  noLessonsDesc: string;
  lessonSaved: string;
  lessonDeleted: string;
  uploadImage: string;
  lessonTitle: string;
  enterLessonTitle: string;
  save: string;
  cancel: string;
  lessonModeActive: string;
  lessonModeDescription: string;
  lessonSuggestion1: string;
  lessonSuggestion2: string;
  lessonSuggestion3: string;
  attachedImages: string;
  thinkDeeper: string;
  reference: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    smartSearch: 'بحث ذكي',
    newSearch: 'بحث جديد',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    heroTitle: 'بحث ذكي',
    heroDescription: 'اطرح أي سؤال واحصل على إجابات فورية مع مصادر موثوقة',
    generalSearch: 'بحث عام',
    news: 'أخبار',
    discover: 'اكتشف',
    smartAnswer: 'إجابة ذكية',
    searchPlaceholder: 'اسأل أي سؤال...',
    newsPlaceholder: 'ابحث عن أحدث الأخبار...',
    trySuggestions: 'جرب:',
    suggestion1: 'آخر أخبار التكنولوجيا',
    suggestion2: 'ما هو الذكاء الاصطناعي؟',
    suggestion3: 'أخبار الرياضة اليوم',
    searching: 'جاري البحث...',
    sources: 'المصادر',
    answer: 'الإجابة',
    askAnother: 'اسأل سؤالاً آخر',
    history: 'السجل',
    clearAll: 'مسح الكل',
    noHistory: 'لا يوجد سجل بحث',
    noHistoryDesc: 'ابدأ البحث لرؤية السجل هنا',
    generalSearchType: 'بحث عام',
    newsType: 'أخبار',
    now: 'الآن',
    minutesAgo: 'منذ {n} د',
    hoursAgo: 'منذ {n} س',
    daysAgo: 'منذ {n} يوم',
    trendingNews: 'الأخبار الرائجة',
    loadingNews: 'جاري تحميل الأخبار...',
    noNewsAvailable: 'لا توجد أخبار متاحة حالياً',
    readMore: 'اقرأ المزيد',
    retry: 'إعادة المحاولة',
    // Lesson Mode
    lessonMode: 'وضع الدرس',
    saveLesson: 'حفظ الدرس',
    savedLessons: 'الدروس المحفوظة',
    noLessons: 'لا توجد دروس محفوظة',
    noLessonsDesc: 'احفظ درساً لرؤيته هنا',
    lessonSaved: 'تم حفظ الدرس بنجاح',
    lessonDeleted: 'تم حذف الدرس',
    uploadImage: 'رفع صورة',
    lessonTitle: 'عنوان الدرس',
    enterLessonTitle: 'أدخل عنوان الدرس...',
    save: 'حفظ',
    cancel: 'إلغاء',
    lessonModeActive: 'وضع الدرس مفعّل',
    lessonModeDescription: 'أنا مساعدك الدراسي! اسألني عن أي موضوع دراسي',
    lessonSuggestion1: 'اشرح لي نظرية فيثاغورس',
    lessonSuggestion2: 'لخص لي الحرب العالمية الثانية',
    lessonSuggestion3: 'ما هي قوانين نيوتن للحركة؟',
    attachedImages: 'الصور المرفقة',
    thinkDeeper: 'فكر بأكثر عمق',
    reference: 'الإحالة',
  },
  en: {
    smartSearch: 'Smart Search',
    newSearch: 'New Search',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    heroTitle: 'Smart Search',
    heroDescription: 'Ask any question and get instant answers with reliable sources',
    generalSearch: 'General',
    news: 'News',
    discover: 'Discover',
    smartAnswer: 'Smart Answer',
    searchPlaceholder: 'Ask anything...',
    newsPlaceholder: 'Search for latest news...',
    trySuggestions: 'Try:',
    suggestion1: 'Latest tech news',
    suggestion2: 'What is artificial intelligence?',
    suggestion3: 'Sports news today',
    searching: 'Searching...',
    sources: 'Sources',
    answer: 'Answer',
    askAnother: 'Ask another question',
    history: 'History',
    clearAll: 'Clear all',
    noHistory: 'No search history',
    noHistoryDesc: 'Start searching to see history here',
    generalSearchType: 'General',
    newsType: 'News',
    now: 'Just now',
    minutesAgo: '{n}m ago',
    hoursAgo: '{n}h ago',
    daysAgo: '{n}d ago',
    trendingNews: 'Trending News',
    loadingNews: 'Loading news...',
    noNewsAvailable: 'No news available at the moment',
    readMore: 'Read more',
    retry: 'Retry',
    // Lesson Mode
    lessonMode: 'Lesson Mode',
    saveLesson: 'Save Lesson',
    savedLessons: 'Saved Lessons',
    noLessons: 'No saved lessons',
    noLessonsDesc: 'Save a lesson to see it here',
    lessonSaved: 'Lesson saved successfully',
    lessonDeleted: 'Lesson deleted',
    uploadImage: 'Upload Image',
    lessonTitle: 'Lesson Title',
    enterLessonTitle: 'Enter lesson title...',
    save: 'Save',
    cancel: 'Cancel',
    lessonModeActive: 'Lesson Mode Active',
    lessonModeDescription: "I'm your study assistant! Ask me about any school topic",
    lessonSuggestion1: 'Explain the Pythagorean theorem',
    lessonSuggestion2: 'Summarize World War II',
    lessonSuggestion3: "What are Newton's laws of motion?",
    attachedImages: 'Attached Images',
    thinkDeeper: 'Think Deeper',
    reference: 'Reference',
  },
  de: {
    smartSearch: 'Intelligente Suche',
    newSearch: 'Neue Suche',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    heroTitle: 'Intelligente Suche',
    heroDescription: 'Stellen Sie eine Frage und erhalten Sie sofortige Antworten mit zuverlässigen Quellen',
    generalSearch: 'Allgemein',
    news: 'Nachrichten',
    discover: 'Entdecken',
    smartAnswer: 'Intelligente Antwort',
    searchPlaceholder: 'Fragen Sie etwas...',
    newsPlaceholder: 'Suchen Sie nach aktuellen Nachrichten...',
    trySuggestions: 'Versuchen Sie:',
    suggestion1: 'Neueste Tech-Nachrichten',
    suggestion2: 'Was ist künstliche Intelligenz?',
    suggestion3: 'Sport-Nachrichten heute',
    searching: 'Suche läuft...',
    sources: 'Quellen',
    answer: 'Antwort',
    askAnother: 'Stellen Sie eine weitere Frage',
    history: 'Verlauf',
    clearAll: 'Alles löschen',
    noHistory: 'Kein Suchverlauf',
    noHistoryDesc: 'Beginnen Sie mit der Suche, um den Verlauf hier zu sehen',
    generalSearchType: 'Allgemein',
    newsType: 'Nachrichten',
    now: 'Gerade eben',
    minutesAgo: 'vor {n} Min.',
    hoursAgo: 'vor {n} Std.',
    daysAgo: 'vor {n} Tag(en)',
    trendingNews: 'Trending Nachrichten',
    loadingNews: 'Nachrichten werden geladen...',
    noNewsAvailable: 'Momentan keine Nachrichten verfügbar',
    readMore: 'Weiterlesen',
    retry: 'Wiederholen',
    // Lesson Mode
    lessonMode: 'Unterrichtsmodus',
    saveLesson: 'Lektion speichern',
    savedLessons: 'Gespeicherte Lektionen',
    noLessons: 'Keine gespeicherten Lektionen',
    noLessonsDesc: 'Speichern Sie eine Lektion, um sie hier zu sehen',
    lessonSaved: 'Lektion erfolgreich gespeichert',
    lessonDeleted: 'Lektion gelöscht',
    uploadImage: 'Bild hochladen',
    lessonTitle: 'Lektionstitel',
    enterLessonTitle: 'Lektionstitel eingeben...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    lessonModeActive: 'Unterrichtsmodus aktiv',
    lessonModeDescription: 'Ich bin Ihr Lernassistent! Fragen Sie mich zu jedem Schulthema',
    lessonSuggestion1: 'Erkläre den Satz des Pythagoras',
    lessonSuggestion2: 'Fasse den Zweiten Weltkrieg zusammen',
    lessonSuggestion3: 'Was sind Newtons Bewegungsgesetze?',
    attachedImages: 'Angehängte Bilder',
    thinkDeeper: 'Tiefer Denken',
    reference: 'Verweis',
  },
};
