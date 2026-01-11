import { Search, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'general' | 'news';
  timestamp: Date;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const SearchHistory = ({
  history,
  currentId,
  onSelect,
  onDelete,
  onClear,
}: SearchHistoryProps) => {
  const { t, language } = useLanguage();

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.now;
    if (minutes < 60) return t.minutesAgo.replace('{n}', String(minutes));
    if (hours < 24) return t.hoursAgo.replace('{n}', String(hours));
    if (days < 7) return t.daysAgo.replace('{n}', String(days));
    return date.toLocaleDateString(language === 'ar' ? 'ar' : language === 'de' ? 'de' : 'en');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Clock className="mb-3 h-8 w-8" />
        <p className="text-sm">{t.noHistory}</p>
        <p className="text-xs">{t.noHistoryDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-sm font-medium text-muted-foreground">{t.history}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
        >
          {t.clearAll}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg p-2.5 transition-colors cursor-pointer",
                currentId === item.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => onSelect(item.id)}
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" dir="auto">{item.query}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'news' ? t.newsType : t.generalSearchType} • {formatTime(item.timestamp)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
