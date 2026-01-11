import { useState, useRef, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  query?: string;
  searchType?: string;
  isLoading?: boolean;
}

interface ContinuousChatProps {
  onSearch: (query: string, type: 'general' | 'news' | 'smart', images?: string[]) => void;
  currentSearch: any;
  disabled?: boolean;
  lessonMode?: boolean;
}

export const ContinuousChat = ({ 
  onSearch, 
  currentSearch, 
  disabled = false,
  lessonMode = false
}: ContinuousChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('soar_chat_messages');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
      return parsed.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist chat messages (ChatGPT-like continuity after refresh)
  useEffect(() => {
    try {
      const serializable = messages.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }));
      localStorage.setItem('soar_chat_messages', JSON.stringify(serializable));
    } catch {
      // ignore persistence errors
    }
  }, [messages]);

  // Add current search result to messages
  useEffect(() => {
    if (currentSearch?.result?.content && !currentSearch?.isLoading) {
      const newMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: currentSearch.result.content,
        timestamp: new Date(),
        type: 'assistant',
        query: currentSearch.query,
        searchType: currentSearch.type
      };
      
      setMessages(prev => {
        // Check if this message already exists
        const exists = prev.some(msg => 
          msg.type === 'assistant' && 
          msg.query === currentSearch.query &&
          Math.abs(msg.timestamp.getTime() - new Date().getTime()) < 5000
        );
        
        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
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
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and trigger search
    const query = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Determine search type based on lesson mode
    const searchType = lessonMode ? 'lesson' as any : 'general';
    
    // Trigger search
    onSearch(query, searchType);
    
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20 rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {lessonMode ? 'محادثة دراسية' : 'محادثة ذكية'}
          </h3>
          {lessonMode && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>وضع الدرس</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">ابدأ محادثة جديدة</p>
            <p className="text-sm">
              {lessonMode 
                ? 'اسأل عن أي درس أو موضوع دراسي' 
                : 'اسأل عن أي موضوع أو ابحث عن معلومات'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 p-4 rounded-lg border transition-all duration-200",
                message.type === 'user' 
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex-shrink-0">
                {message.type === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center text-white">
                    {message.isLoading ? (
                      <div className="animate-spin">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.type === 'user' ? 'أنت' : 'المساعد الذكي'}
                    </span>
                    {message.query && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'assistant' && !message.isLoading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                
                <div className={cn(
                  "text-sm",
                  message.type === 'user' 
                    ? "text-blue-800 dark:text-blue-200" 
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
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
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={lessonMode 
                ? "اكتب سؤالك عن الدرس هنا..." 
                : "اكتب سؤالك هنا..."
              }
              className="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={disabled}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || disabled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
            اضغط Enter للإرسال
          </div>
        </div>
      </div>
    </div>
  );
};
