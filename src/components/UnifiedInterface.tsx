import { useState, useRef, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { 
  Send, 
  User, 
  Bot, 
  Copy, 
  Check, 
  Trash2,
  Plus,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  Brain,
  BookOpen,
  Target,
  Zap,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResult } from "@/components/search/SearchResult";
import { sanitizeHtml } from "@/lib/sanitize";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  query?: string;
  searchType?: string;
  isLoading?: boolean;
  images?: string[];
  citations?: string[];
}

interface UnifiedInterfaceProps {
  onSearch: (query: string, type: 'general' | 'news' | 'smart', images?: string[]) => void;
  currentSearch: any;
  disabled?: boolean;
  lessonMode?: boolean;
  onToggleLessonMode: () => void;
  onUploadImage: (file: File) => Promise<string | null>;
  onRemoveImage: (url: string) => void;
  uploadedImages: string[];
  uploading?: boolean;
}

export const UnifiedInterface = ({ 
  onSearch, 
  currentSearch, 
  disabled = false,
  lessonMode = false,
  onToggleLessonMode,
  onUploadImage,
  onRemoveImage,
  uploadedImages = [],
  uploading = false
}: UnifiedInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [searchType, setSearchType] = useState<'general' | 'news' | 'smart'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add current search result to messages
  useEffect(() => {
    if (currentSearch?.result?.content && !currentSearch?.isLoading) {
      // Extract the actual question from enhanced query
      const actualQuery = currentSearch.query.includes('السؤال الحالي:') 
        ? currentSearch.query.split('السؤال الحالي:').pop()?.trim() || currentSearch.query
        : currentSearch.query;
      
      const newMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: currentSearch.result.content,
        timestamp: new Date(),
        type: 'assistant',
        query: actualQuery,
        searchType: currentSearch.type,
        images: currentSearch.images,
        citations: currentSearch.result.citations
      };
      
      setMessages(prev => {
        // Remove loading message if exists
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        
        // Check if this message already exists
        const exists = filteredMessages.some(msg => 
          msg.type === 'assistant' && 
          msg.query === actualQuery &&
          Math.abs(msg.timestamp.getTime() - new Date().getTime()) < 5000
        );
        
        if (!exists) {
          return [...filteredMessages, newMessage];
        }
        return filteredMessages;
      });
    }
  }, [currentSearch?.result?.content, currentSearch?.isLoading]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || disabled) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      timestamp: new Date(),
      type: 'user',
      images: uploadedImages
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and trigger search
    const query = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Build context from previous messages
    const contextMessages = messages.slice(-6); // Keep last 6 messages for context
    const contextText = contextMessages
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    // Create enhanced query with context
    const enhancedQuery = contextText 
      ? `السياق السابق:\n${contextText}\n\nالسؤال الحالي: ${query}`
      : query;

    // Determine search type based on lesson mode and selected type
    const actualSearchType = lessonMode ? 'lesson' as any : searchType;
    
    // Trigger search with context
    onSearch(enhancedQuery, actualSearchType, uploadedImages);
    
    // Add loading message
    setTimeout(() => {
      const loadingMessage: ChatMessage = {
        id: `loading-${Date.now()}`,
        content: "جاري البحث...",
        timestamp: new Date(),
        type: 'assistant',
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMessage]);
    }, 100);
  };

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Remove loading messages when search completes
  useEffect(() => {
    if (currentSearch?.result?.content && !currentSearch?.isLoading) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setIsTyping(false);
    }
  }, [currentSearch?.result?.content, currentSearch?.isLoading]);

  const searchTypeOptions = [
    { value: 'general', label: 'بحث عام', icon: Search, color: 'text-blue-600' },
    { value: 'news', label: 'الأخبار', icon: Brain, color: 'text-green-600' },
    { value: 'smart', label: 'بحث ذكي', icon: Sparkles, color: 'text-purple-600' }
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            مساعد ذكي متقدم
          </h1>
          {lessonMode && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>وضع الدرس</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search Type Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchOptions(!showSearchOptions)}
              className="gap-2"
            >
              {searchTypeOptions.find(opt => opt.value === searchType)?.icon && 
                React.createElement(searchTypeOptions.find(opt => opt.value === searchType)!.icon, { className: "h-4 w-4" })
              }
              <span>{searchTypeOptions.find(opt => opt.value === searchType)?.label}</span>
            </Button>
            
            {showSearchOptions && (
              <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-50">
                {searchTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchType(option.value as any);
                      setShowSearchOptions(false);
                    }}
                    className={cn("w-full justify-start gap-2", option.color)}
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Lesson Mode Toggle */}
          <Button
            variant={lessonMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleLessonMode}
            className={cn(
              "gap-2",
              lessonMode && "bg-gradient-to-r from-primary to-purple-500"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span>{lessonMode ? 'وضع الدرس' : 'بحث عام'}</span>
          </Button>

          {/* Clear Chat */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>مسح</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full" />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 p-6 rounded-xl border transition-all duration-200",
                message.type === 'user' 
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex-shrink-0">
                {message.type === 'user' ? (
                  <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center text-white">
                    {message.isLoading ? (
                      <div className="animate-spin">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {message.type === 'user' ? 'أنت' : 'المساعد الذكي'}
                    </span>
                    {message.query && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        <span className="mx-1">•</span>
                        <span>{message.searchType}</span>
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'assistant' && !message.isLoading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Display images if any */}
                {message.images && message.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {message.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveImage(image)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={cn(
                  "text-sm leading-relaxed",
                  message.type === 'user' 
                    ? "text-blue-800 dark:text-blue-200" 
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.content) }} />
                  )}
                </div>

                {/* Display citations if any */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-muted-foreground mb-2">المصادر:</div>
                    <div className="space-y-1">
                      {message.citations.map((citation, index) => (
                        <div key={index} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {index + 1}. {citation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {/* Display uploaded images */}
        {uploadedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveImage(image)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={lessonMode 
                ? "اكتب سؤالك عن الدرس هنا..." 
                : "اكتب سؤالك هنا..."
              }
              className="w-full p-4 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
              disabled={disabled}
            />
            
            {/* Upload Image Button */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => onUploadImage(file));
                e.target.value = '';
              }}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="absolute left-3 top-3 h-8 w-8 p-0"
              disabled={uploading}
            >
              {uploading ? (
                <div className="animate-spin">
                  <Upload className="h-4 w-4" />
                </div>
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || disabled}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {lessonMode 
              ? 'وضع الدرس: إجابات متخصصة للدراسة والاختبارات' 
              : 'وضع البحث العام: إجابات شاملة لجميع المواضيع'
            }
          </div>
          <div className="text-xs text-muted-foreground">
            اضغط Enter للإرسال، Shift+Enter لسطر جديد
          </div>
        </div>
      </div>
    </div>
  );
};
