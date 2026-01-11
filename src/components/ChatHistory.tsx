import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Download, 
  Brain,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  query?: string;
  searchType?: string;
}

interface ChatHistoryProps {
  onNewChat: () => void;
  onGenerateMindMap: (messages: ChatMessage[]) => void;
  onClearHistory: () => void;
  disabled?: boolean;
}

export const ChatHistory = ({ 
  onNewChat, 
  onGenerateMindMap, 
  onClearHistory, 
  disabled = false 
}: ChatHistoryProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showMindMap, setShowMindMap] = useState(false);
  const { t } = useLanguage();

  // Mock chat history data
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      content: 'شرحت لي نظرية فيثاغورس في الفيزياء',
      timestamp: new Date(Date.now() - 86400000),
      type: 'assistant',
      query: 'نظرية فيثاغورس',
      searchType: 'lesson'
    },
    {
      id: '2',
      content: 'قمت بتلخيص الدرس في جداول منظمة',
      timestamp: new Date(Date.now() - 172800000),
      type: 'assistant',
      query: 'تلخيص الدرس',
      searchType: 'lesson'
    },
    {
      id: '3',
      content: 'قدمت أسئلة تدريبية مع حلول',
      timestamp: new Date(Date.now() - 259200000),
      type: 'assistant',
      query: 'أسئلة تدريبية',
      searchType: 'lesson'
    },
    {
      id: '4',
      content: 'أعطيت نصائح للاختبار النهائي',
      timestamp: new Date(Date.now() - 345600000),
      type: 'assistant',
      query: 'نصائح الاختبار',
      searchType: 'lesson'
    },
    {
      id: '5',
      content: 'أنشأت خريطة ذهنية للدرس',
      timestamp: new Date(Date.now() - 432000000),
      type: 'assistant',
      query: 'خريطة ذهنية',
      searchType: 'lesson'
    }
  ];

  const handleGenerateMindMap = () => {
    onGenerateMindMap(messages);
  };

  const handleClearHistory = () => {
    setMessages([]);
    onClearHistory();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} يوم${days > 1 ? 'ين' : ''} مضى`;
    } else if (hours > 0) {
      return `${hours} ساعة${hours > 1 ? 'ات' : ''} مضى`;
    } else {
      return 'الآن';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">سجل المحادثات</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            disabled={disabled}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>محادثة جديدة</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMindMap}
            disabled={disabled || messages.length === 0}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            <span>خريطة ذهنية</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={disabled || messages.length === 0}
            className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>مسح السجل</span>
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">لا توجد محادثات سابقة</p>
            <p className="text-sm">ابدأ محادثة جديدة أو ابحث في وضع الدرس</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 p-4 rounded-lg border transition-all duration-200",
                message.type === 'user' 
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 ml-8" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              )}
            >
              {message.type === 'user' ? (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white font-medium">
                    {message.content.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">
                        {message.query && (
                          <div className="flex items-center gap-1">
                            <Search className="h-3 w-3" />
                            <span className="font-medium">{message.searchType}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mind Map Modal */}
      {showMindMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">خريطة ذهنية من المحادثات</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMindMap(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="text-center text-muted-foreground py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">سيتم إنشاء خريطة ذهنية</p>
              <p className="text-sm">من المحادثات السابقة</p>
              <p className="text-xs text-muted-foreground mt-4">
                تم تحليل {messages.length} رسالة<br />
                تم تحديد {Math.floor(messages.length * 0.7)} مفهوم رئيسي<br />
                تم إنشاء {Math.floor(messages.length * 0.5)} رابط بين المفاهيم
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
