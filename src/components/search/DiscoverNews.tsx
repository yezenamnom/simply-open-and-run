import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NewsItem {
  title: string;
  summary: string;
  url?: string;
  source?: string;
  imageUrl?: string;
}

interface DiscoverNewsProps {
  onNewsClick: (query: string) => void;
}

export function DiscoverNews({ onNewsClick }: DiscoverNewsProps) {
  const { t, language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const newsQuery = language === 'ar' 
        ? 'أهم الأخبار العالمية اليوم' 
        : language === 'de' 
          ? 'Die wichtigsten Nachrichten heute' 
          : 'Top trending news today';

      const { data, error: apiError } = await supabase.functions.invoke('perplexity-search', {
        body: { 
          query: newsQuery, 
          searchType: 'discover',
          language 
        },
      });

      if (apiError) throw apiError;

      if (data?.newsItems) {
        setNews(data.newsItems);
      } else if (data?.content) {
        const items = parseNewsContent(data.content, data.citations || []);
        setNews(items);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [language]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t.discover || 'Discover'}</h2>
        </div>
        
        {/* Featured skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="aspect-video rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-3 py-4">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border bg-card">
              <div className="aspect-video bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">{t.noNewsAvailable}</p>
        <Button variant="outline" size="lg" onClick={fetchNews} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.retry || 'Retry'}
        </Button>
      </div>
    );
  }

  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">{t.discover || 'Discover'}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">{t.trendingNews}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchNews} className="rounded-full">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Featured News Card */}
      {featuredNews && (
        <button
          onClick={() => onNewsClick(featuredNews.title)}
          className={cn(
            "w-full text-left group",
            "grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 rounded-3xl",
            "bg-card border-2 border-transparent",
            "hover:border-primary hover:shadow-xl transition-all duration-300"
          )}
        >
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {featuredNews.imageUrl ? (
              <img 
                src={featuredNews.imageUrl} 
                alt={featuredNews.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Globe className="h-20 w-20 text-primary/40" />
            )}
          </div>
          <div className="flex flex-col justify-center py-2">
            <h3 className="text-xl lg:text-2xl font-bold mb-3 line-clamp-3 group-hover:text-primary transition-colors" dir="auto">
              {featuredNews.title}
            </h3>
            <p className="text-muted-foreground line-clamp-3 mb-4" dir="auto">
              {featuredNews.summary}
            </p>
            {featuredNews.source && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <Globe className="h-3 w-3" />
                </div>
                <span>{featuredNews.source}</span>
              </div>
            )}
          </div>
        </button>
      )}

      {/* News Grid */}
      {otherNews.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherNews.map((item, index) => (
            <button
              key={index}
              onClick={() => onNewsClick(item.title)}
              className={cn(
                "text-left rounded-2xl overflow-hidden border bg-card group",
                "hover:border-primary hover:shadow-lg hover:scale-[1.02]",
                "transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Newspaper className="h-12 w-12 text-primary/30" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors" dir="auto">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2" dir="auto">
                  {item.summary}
                </p>
                {item.source && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-2.5 w-2.5" />
                    </div>
                    <span className="truncate">{item.source}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function parseNewsContent(content: string, citations: string[]): NewsItem[] {
  const items: NewsItem[] = [];
  const lines = content.split('\n').filter(l => l.trim());
  
  let currentItem: Partial<NewsItem> = {};
  
  for (const line of lines) {
    const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
    
    if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
      if (currentItem.title) {
        items.push(currentItem as NewsItem);
      }
      currentItem = {
        title: cleanLine.replace(/\*\*/g, ''),
        summary: '',
      };
    } else if (currentItem.title && !currentItem.summary) {
      currentItem.summary = cleanLine.substring(0, 150);
    }
  }
  
  if (currentItem.title) {
    items.push(currentItem as NewsItem);
  }

  if (items.length < 3 && citations.length > 0) {
    return citations.slice(0, 6).map((url, i) => ({
      title: `News Story ${i + 1}`,
      summary: content.substring(i * 100, (i + 1) * 100).trim() || 'Click to read more',
      url,
      source: getDomain(url),
    }));
  }

  return items.slice(0, 6).map((item, i) => ({
    ...item,
    url: citations[i],
    source: citations[i] ? getDomain(citations[i]) : undefined,
  }));
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}
