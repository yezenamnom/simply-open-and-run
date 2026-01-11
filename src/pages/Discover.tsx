import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, RefreshCw, TrendingUp, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NewsItem {
  title: string;
  summary: string;
  url?: string;
  source?: string;
  imageUrl?: string;
}

export default function Discover() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await supabase.functions.invoke('perplexity-search', {
        body: { 
          query: 'discover',
          searchType: 'discover-images',
          language 
        },
      });

      if (apiError) throw apiError;

      if (data?.newsItems) {
        setNews(data.newsItems);
      } else if (data?.content) {
        const items = parseNewsContent(data.content, data.citations || [], data.images || []);
        setNews(items);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      // Use mock data as fallback
      const mockNews = getMockNewsData(language);
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [language]);

  const handleNewsClick = (item: NewsItem) => {
    if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">{t.discover}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchNews} disabled={loading}>
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </Button>
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Featured skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="aspect-[16/10] rounded-3xl bg-muted animate-pulse" />
              <div className="flex flex-col justify-center space-y-4 py-4">
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            {/* Grid skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border bg-card">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error || news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Newspaper className="h-20 w-20 text-muted-foreground mb-6" />
            <p className="text-xl text-muted-foreground mb-4">{t.noNewsAvailable}</p>
            <Button onClick={fetchNews} size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.retry}
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured News */}
            {news[0] && (
              <button
                onClick={() => handleNewsClick(news[0])}
                className={cn(
                  "w-full text-left group",
                  "grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 rounded-3xl",
                  "bg-card border-2 border-transparent",
                  "hover:border-primary hover:shadow-2xl transition-all duration-300"
                )}
              >
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {news[0].imageUrl ? (
                    <img 
                      src={news[0].imageUrl} 
                      alt={news[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Globe className="h-24 w-24 text-primary/30" />
                  )}
                </div>
                <div className="flex flex-col justify-center py-2">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4 line-clamp-3 group-hover:text-primary transition-colors" dir="auto">
                    {news[0].title}
                  </h2>
                  <p className="text-lg text-muted-foreground line-clamp-3 mb-4" dir="auto">
                    {news[0].summary}
                  </p>
                  {news[0].source && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <span>{news[0].source}</span>
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* News Grid */}
            {news.length > 1 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {news.slice(1).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNewsClick(item)}
                    className={cn(
                      "text-left rounded-2xl overflow-hidden border bg-card group",
                      "hover:border-primary hover:shadow-xl hover:scale-[1.02]",
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
                        <Newspaper className="h-14 w-14 text-primary/30" />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors" dir="auto">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2" dir="auto">
                        {item.summary}
                      </p>
                      {item.source && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <Globe className="h-3 w-3" />
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
        )}
      </main>
    </div>
  );
}

function parseNewsContent(content: string, citations: string[], images: string[] = []): NewsItem[] {
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
      currentItem.summary = cleanLine.substring(0, 200);
    }
  }
  
  if (currentItem.title) {
    items.push(currentItem as NewsItem);
  }

  if (items.length < 3 && citations.length > 0) {
    return citations.slice(0, 8).map((url, i) => ({
      title: `News Story ${i + 1}`,
      summary: content.substring(i * 100, (i + 1) * 100).trim() || 'Click to read more',
      url,
      source: getDomain(url),
      imageUrl: images[i] || undefined,
    }));
  }

  return items.slice(0, 8).map((item, i) => ({
    ...item,
    url: citations[i],
    source: citations[i] ? getDomain(citations[i]) : undefined,
    imageUrl: images[i] || undefined,
  }));
}

function getMockNewsData(language: string): NewsItem[] {
  const mockData: Record<string, NewsItem[]> = {
    ar: [
      {
        title: 'التطورات التكنولوجية الحديثة في 2024',
        summary: 'شهدت التكنولوجيا تقدماً هائلاً هذا العام مع ظهور الذكاء الاصطناعي التوليدي وتقنيات الواقع المعزز.',
        url: 'https://example.com/tech-news-2024',
        source: 'tech.example.com'
      },
      {
        title: 'الأحداث الرياضية العالمية',
        summary: 'استضافات كبرى للبطولات الرياضية مع إنجازات قياسية جديدة في مختلف الرياضات.',
        url: 'https://example.com/sports-updates',
        source: 'sports.example.com'
      },
      {
        title: 'التغيرات الاقتصادية العالمية',
        summary: 'شهدت الأسواق المالية تقلبات بسبب التغيرات الجيوسياسية والسياسات النقدية الجديدة.',
        url: 'https://example.com/economy-news',
        source: 'economy.example.com'
      },
      {
        title: 'الابتكارات في الطاقة المتجددة',
        summary: 'تطورات جديدة في الطاقة الشمسية والرياح مع تكاليف أقل وكفاءة أعلى.',
        url: 'https://example.com/renewable-energy',
        source: 'energy.example.com'
      },
      {
        title: 'التقدم في الرعاية الصحية',
        summary: 'اكتشافات طبية جديدة وعلاجات مبتكرة للأمراض المزمنة.',
        url: 'https://example.com/healthcare-innovation',
        source: 'health.example.com'
      },
      {
        title: 'الفضاء واستكشاف الكواكب',
        summary: 'بعثات فضائية جديدة واكتشافات علمية هامة في مجال الفضاء.',
        url: 'https://example.com/space-exploration',
        source: 'space.example.com'
      }
    ],
    en: [
      {
        title: 'Latest Technology Trends in 2024',
        summary: 'Technology has seen tremendous advancement this year with the emergence of generative AI and augmented reality technologies.',
        url: 'https://example.com/tech-trends-2024',
        source: 'tech.example.com'
      },
      {
        title: 'Global Sports Events',
        summary: 'Major sports tournaments hosted with new record-breaking achievements across various sports.',
        url: 'https://example.com/global-sports',
        source: 'sports.example.com'
      },
      {
        title: 'World Economic Changes',
        summary: 'Financial markets experienced volatility due to geopolitical changes and new monetary policies.',
        url: 'https://example.com/economic-changes',
        source: 'economy.example.com'
      },
      {
        title: 'Renewable Energy Innovations',
        summary: 'New developments in solar and wind power with lower costs and higher efficiency.',
        url: 'https://example.com/renewable-energy',
        source: 'energy.example.com'
      },
      {
        title: 'Healthcare Progress',
        summary: 'New medical discoveries and innovative treatments for chronic diseases.',
        url: 'https://example.com/healthcare-progress',
        source: 'health.example.com'
      },
      {
        title: 'Space and Planetary Exploration',
        summary: 'New space missions and important scientific discoveries in space exploration.',
        url: 'https://example.com/space-exploration',
        source: 'space.example.com'
      }
    ],
    de: [
      {
        title: 'Neueste Technologietrends 2024',
        summary: 'Die Technologie hat dieses Jahr gewaltige Fortschritte gemacht mit dem Aufkommen von generativer KI und Augmented-Reality-Technologien.',
        url: 'https://example.com/tech-trends-2024',
        source: 'tech.example.com'
      },
      {
        title: 'Globale Sportereignisse',
        summary: 'Große Sportturniere ausgerichtet mit neuen rekordbrechenden Leistungen in verschiedenen Sportarten.',
        url: 'https://example.com/global-sports',
        source: 'sports.example.com'
      },
      {
        title: 'Weltwirtschaftliche Veränderungen',
        summary: 'Die Finanzmärkte erlebten Volatilität aufgrund geopolitischer Veränderungen und neuer Geldpolitiken.',
        url: 'https://example.com/economic-changes',
        source: 'economy.example.com'
      },
      {
        title: 'Innovationen bei erneuerbaren Energien',
        summary: 'Neue Entwicklungen bei Solar- und Windkraft mit geringeren Kosten und höherer Effizienz.',
        url: 'https://example.com/renewable-energy',
        source: 'energy.example.com'
      },
      {
        title: 'Fortschritte im Gesundheitswesen',
        summary: 'Neue medizinische Entdeckungen und innovative Behandlungen für chronische Krankheiten.',
        url: 'https://example.com/healthcare-progress',
        source: 'health.example.com'
      },
      {
        title: 'Weltraum- und Planetenerkundung',
        summary: 'Neue Weltraummissionen und wichtige wissenschaftliche Entdeckungen in der Weltraumerkundung.',
        url: 'https://example.com/space-exploration',
        source: 'space.example.com'
      }
    ]
  };
  
  return mockData[language] || mockData.en;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}
