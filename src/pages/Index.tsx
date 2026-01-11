import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, Plus, X, Sparkles, GraduationCap, Save, PanelLeftClose, PanelLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedInterface } from "@/components/UnifiedInterface";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResult } from "@/components/search/SearchResult";
import { SearchHistory } from "@/components/search/SearchHistory";
import { LessonsList } from "@/components/search/LessonsList";
import { LessonView } from "@/components/search/LessonView";
import { SaveLessonDialog } from "@/components/search/SaveLessonDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { usePerplexitySearch } from "@/hooks/usePerplexitySearch";
import { useLessons, Lesson } from "@/hooks/useLessons";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useClaudeModelSelection } from "@/hooks/usePuter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LessonExport } from "@/components/lessons/LessonExport";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { WorkflowManager } from "@/components/lessons/WorkflowManager";

const Index = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [useUnifiedInterface] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isThinkingDeeper, setIsThinkingDeeper] = useState(false);
  const [saveLessonOpen, setSaveLessonOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const { selectedModel } = useClaudeModelSelection();
  const {
    currentSearch,
    chatMessages,
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
  } = usePerplexitySearch({ enabled: true, model: selectedModel });

  const { lessons, loading: lessonsLoading, saveLesson, deleteLesson } = useLessons();
  const { uploading, analyzing, uploadedImages, imagesWithAnalysis, uploadImage, removeImage, clearImages } = useImageUpload();

  const showHero = !currentSearch && !selectedLesson;

  const handleThinkDeeper = () => {
    if (currentSearch?.query && currentSearch?.type === 'smart') {
      setIsThinkingDeeper(true);
      // Search with enhanced prompt for deeper analysis
      search(
        `${currentSearch.query} - ${t.thinkDeeper}: Provide more detailed analysis, examples, and comprehensive explanation with tables and structured content.`,
        'smart',
        uploadedImages
      );
    }
  };

  const handleSaveLesson = async (title: string) => {
    if (!currentSearch?.result?.content) {
      toast({
        title: 'خطأ',
        description: 'لا يوجد محتوى لحفظه. يرجى إجراء بحث أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (!title || !title.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال عنوان للدرس',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await saveLesson(
        title.trim(),
        currentSearch.query || '',
        currentSearch.result.content,
        currentSearch.result.citations || [],
        currentSearch.images || [],
        (currentSearch as any).plan || null
      );
      
      if (result) {
        setSaveLessonOpen(false);
        clearImages();
      }
    } catch (error) {
      console.error('Error in handleSaveLesson:', error);
    }
  };

  const handleNewChat = () => {
    goHome();
  };

  const handleGenerateMindMap = (messages: unknown[]) => {
    console.log('Generating mind map from messages:', messages);
    alert('سيتم إنشاء خريطة ذهنية من المحادثات!');
  };

  const handleClearHistory = () => {
    console.log('Clearing chat history');
    alert('تم مسح سجل المحادثات!');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSidebarOpen(false);
  };

  const handleGoHome = () => {
    goHome();
    setSelectedLesson(null);
  };

  const handleSearch = (query: string, type: 'general' | 'news' | 'smart', images?: string[]) => {
    setSelectedLesson(null);
    // استخدم chat دائماً للاستمرار في نفس المحادثة (مثل ChatGPT)
    chat(query, type, uploadedImages);
    if (!lessonMode) {
      clearImages();
    }
  };

  const handlePDFUpload = async (file: File) => {
    // هنا يمكن إضافة منطق لمعالجة PDF
    // مثلاً: استخراج النص، تحليله، إضافته للبحث
    console.log('PDF uploaded:', file.name);
    // يمكن استخدام مكتبة مثل pdf-parse لاستخراج النص
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full border-r bg-card transition-all duration-300 md:static",
          sidebarCollapsed ? "w-16" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col relative">
          {/* زر طي سريع في الأعلى */}
          {!sidebarCollapsed && (
            <div className="absolute top-14 -right-3 z-10 hidden md:block">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-6 w-6 rounded-full bg-background border shadow-md hover:bg-accent transition-all"
                title="طي الجانب"
              >
                <PanelLeftClose className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Sidebar Header */}
          <div className={cn(
            "flex h-14 items-center border-b px-3",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}>
            {!sidebarCollapsed && (
              <button onClick={handleGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground shrink-0",
                  lessonMode ? "bg-gradient-to-r from-primary to-purple-500" : "bg-primary"
                )}>
                  {lessonMode ? <GraduationCap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <span className="font-bold text-lg truncate">
                  {lessonMode ? t.lessonMode : t.smartSearch}
                </span>
              </button>
            )}
            
            {sidebarCollapsed && (
              <button onClick={handleGoHome} className="hover:opacity-80 transition-opacity">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground",
                  lessonMode ? "bg-gradient-to-r from-primary to-purple-500" : "bg-primary"
                )}>
                  {lessonMode ? <GraduationCap className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
              </button>
            )}
            
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleGoHome} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <>
              {lessonMode ? (
                <LessonsList
                  lessons={lessons}
                  currentId={selectedLesson?.id || null}
                  onSelect={handleLessonSelect}
                  onDelete={deleteLesson}
                  loading={lessonsLoading}
                />
              ) : (
                <>
                  {!useUnifiedInterface ? (
                    <SearchHistory
                      history={history}
                      currentId={currentSearchId}
                      onSelect={(id) => { selectSearch(id); setSelectedLesson(null); setSidebarOpen(false); }}
                      onDelete={deleteSearch}
                      onClear={clearHistory}
                    />
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">
                      المحادثة المستمرة لا تُنشئ عناصر جديدة في السجل
                    </div>
                  )}
                </>
              )}
            </>
          )}
          
          {/* Collapse/Expand Button - زر انزلاق محسّن */}
          <div className={cn(
            "mt-auto border-t p-3",
            sidebarCollapsed ? "flex justify-center" : "flex justify-between items-center"
          )}>
            {!sidebarCollapsed && (
              <span className="text-xs text-muted-foreground px-2">
                طي الجانب
              </span>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "h-9 w-9 transition-all duration-200 hover:bg-accent",
                "hidden md:flex",
                sidebarCollapsed ? "mx-auto" : ""
              )}
              title={sidebarCollapsed ? "فتح الجانب" : "طي الجانب"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <SaveLessonDialog
          open={saveLessonOpen}
          onClose={() => setSaveLessonOpen(false)}
          onSave={handleSaveLesson}
          query={currentSearch?.query || ''}
          images={currentSearch?.images || uploadedImages || []}
        />
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            {!showHero && (
              <Button variant="ghost" size="icon" onClick={handleGoHome}>
                <Home className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">

            {lessonMode && (
              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={t.saveLesson}
                  onClick={() => setSaveLessonOpen(true)}
                  disabled={!currentSearch?.result?.content}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <LessonExport lessons={lessons} />
                <LessonSummary lessons={lessons} />
              </div>
            )}

            {/* Lesson Mode Toggle */}
            <Button
              variant={lessonMode ? "default" : "outline"}
              size="sm"
              onClick={toggleLessonMode}
              className={cn(
                "gap-2",
                lessonMode && "bg-gradient-to-r from-primary to-purple-500"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              {t.lessonMode}
            </Button>

            {/* Workflow Builder Button */}
            <WorkflowManager />
            
            {/* Discover Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/discover')}
              className="gap-2"
            >
              <Compass className="h-4 w-4" />
              {t.discover}
            </Button>
            
            <UserMenu />
            <LanguageSwitcher />
            <DarkModeToggle />
            <Button variant="ghost" size="icon" onClick={handleGoHome}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto scrollbar-thin relative pb-32">
          {useUnifiedInterface ? (
            <div className="flex min-h-full">
              <UnifiedInterface
                onSearch={handleSearch}
                currentSearch={currentSearch}
                disabled={false}
                lessonMode={lessonMode}
                onToggleLessonMode={toggleLessonMode}
                onUploadImage={uploadImage}
                onRemoveImage={removeImage}
                uploadedImages={uploadedImages}
                uploading={uploading}
              />
            </div>
          ) : (
            <>
              {/* Hero Section */}
              {showHero && (
                <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
                  <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      محرك البحث الذكي
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                      ابحث عن أي معلومة واحصل على إجابات دقيقة
                    </p>
                  </div>
                  <SearchInput 
                    onSearch={handleSearch} 
                    disabled={false}
                    variant="hero"
                    lessonMode={lessonMode}
                    onUploadImage={uploadImage}
                    onRemoveImage={removeImage}
                    uploading={uploading}
                    analyzing={analyzing}
                    imagesWithAnalysis={imagesWithAnalysis}
                    onUploadPDF={handlePDFUpload}
                  />
                </div>
              )}

              {/* Search Results - عرض جميع رسائل المحادثة */}
              {!showHero && (
                <div className="p-4 pb-32 space-y-6">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((searchItem) => (
                      <SearchResult
                        key={searchItem.id}
                        query={searchItem.query}
                        content={searchItem.result?.content || ''}
                        citations={searchItem.result?.citations || []}
                        isLoading={searchItem.isLoading}
                        images={searchItem.images}
                        searchType={searchItem.type as 'general' | 'news' | 'smart'}
                        onThinkDeeper={searchItem.id === currentSearchId ? handleThinkDeeper : undefined}
                      />
                    ))
                  ) : currentSearch ? (
                    <SearchResult
                      query={currentSearch.query}
                      content={currentSearch.result?.content || ''}
                      citations={currentSearch.result?.citations || []}
                      isLoading={currentSearch.isLoading}
                      images={currentSearch.images}
                      searchType={currentSearch.type as 'general' | 'news' | 'smart'}
                      onThinkDeeper={handleThinkDeeper}
                    />
                  ) : null}
                </div>
              )}

              {!showHero && (!currentSearch || !currentSearch.isLoading) && (
                <div className={cn(
                  "fixed bottom-0 z-50 bg-background/95 backdrop-blur-sm py-4 border-t px-4 transition-all duration-300",
                  "left-0 right-0",
                  // على desktop: يبدأ من بعد الـ sidebar
                  "md:transition-all md:duration-300",
                  sidebarCollapsed ? "md:left-16" : "md:left-72"
                )}>
                  <div className="max-w-4xl mx-auto">
                    <SearchInput 
                      onSearch={handleSearch} 
                      disabled={false}
                      variant="compact"
                      lessonMode={lessonMode}
                      onUploadImage={uploadImage}
                      onRemoveImage={removeImage}
                      uploading={uploading}
                      analyzing={analyzing}
                      imagesWithAnalysis={imagesWithAnalysis}
                      onUploadPDF={handlePDFUpload}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Removed Chat History Modal - using ContinuousChat instead */}
    </div>
  );
};

export default Index;
