import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check if query needs web search or can be answered directly
function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  // Simple greetings and conversational messages - no search needed
  const greetings = [
    'hello', 'hi', 'hey', 'hola', 'bonjour', 'hallo', 'ciao',
    'مرحبا', 'اهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير',
    'good morning', 'good evening', 'good night', 'thanks', 'thank you',
    'شكرا', 'شكراً', 'مع السلامة', 'bye', 'goodbye',
    'guten tag', 'guten morgen', 'guten abend', 'danke', 'tschüss',
    'كيف حالك', 'how are you', 'wie geht es dir',
  ];
  
  // Check if it's just a greeting
  for (const greeting of greetings) {
    if (lowerQuery === greeting || lowerQuery.replace(/[?!.,؟]/g, '') === greeting) {
      return false;
    }
  }
  
  // Very short queries (1-2 words) that are likely just casual chat
  const words = lowerQuery.split(/\s+/);
  if (words.length <= 2 && !lowerQuery.includes('?') && !lowerQuery.includes('؟')) {
    // Check if it's not a specific topic query
    const topicIndicators = ['what', 'how', 'why', 'when', 'where', 'who', 'which',
      'ما', 'كيف', 'لماذا', 'متى', 'أين', 'من', 'اي', 'هل',
      'was', 'wie', 'warum', 'wann', 'wo', 'wer', 'welche'];
    const hasTopicIndicator = topicIndicators.some(t => lowerQuery.includes(t));
    if (!hasTopicIndicator) {
      return false;
    }
  }
  
  return true;
}

// Get conversational response for simple messages
function getConversationalResponse(query: string, language: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  const responses: Record<string, Record<string, string>> = {
    greeting: {
      ar: 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟ يمكنك أن تسألني عن أي موضوع.',
      en: 'Hello! How can I help you today? Feel free to ask me about anything.',
      de: 'Hallo! Wie kann ich Ihnen heute helfen? Fragen Sie mich gerne zu jedem Thema.',
    },
    thanks: {
      ar: 'على الرحب والسعة! هل هناك شيء آخر يمكنني مساعدتك به؟',
      en: "You're welcome! Is there anything else I can help you with?",
      de: 'Gern geschehen! Kann ich Ihnen noch bei etwas anderem helfen?',
    },
    howAreYou: {
      ar: 'أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك؟',
      en: "I'm doing well, thanks for asking! How can I assist you?",
      de: 'Mir geht es gut, danke der Nachfrage! Wie kann ich Ihnen helfen?',
    },
    bye: {
      ar: 'مع السلامة! سعدت بمساعدتك.',
      en: 'Goodbye! It was nice helping you.',
      de: 'Auf Wiedersehen! Es war schön, Ihnen zu helfen.',
    },
  };
  
  // Detect message type
  if (/^(hello|hi|hey|مرحبا|اهلا|السلام|صباح|مساء|hallo|guten)/i.test(lowerQuery)) {
    return responses.greeting[language] || responses.greeting.en;
  }
  if (/^(thanks|thank|شكر|danke)/i.test(lowerQuery)) {
    return responses.thanks[language] || responses.thanks.en;
  }
  if (/(how are you|كيف حالك|wie geht)/i.test(lowerQuery)) {
    return responses.howAreYou[language] || responses.howAreYou.en;
  }
  if (/^(bye|goodbye|مع السلامة|tschüss|auf wiedersehen)/i.test(lowerQuery)) {
    return responses.bye[language] || responses.bye.en;
  }
  
  return responses.greeting[language] || responses.greeting.en;
}

// Get mock news data when API is not available
function getMockNews(language: string) {
  const mockData: Record<string, any> = {
    ar: {
      content: `**1. التطورات التكنولوجية الحديثة في 2024**
شهدت التكنولوجيا تقدماً هائلاً هذا العام مع ظهور الذكاء الاصطناعي التوليدي وتقنيات الواقع المعزز.

**2. الأحداث الرياضية العالمية**
استضافات كبرى للبطولات الرياضية مع إنجازات قياسية جديدة في مختلف الرياضات.

**3. التغيرات الاقتصادية العالمية**
شهدت الأسواق المالية تقلبات بسبب التغيرات الجيوسياسية والسياسات النقدية الجديدة.

**4. الابتكارات في الطاقة المتجددة**
تطورات جديدة في الطاقة الشمسية والرياح مع تكاليف أقل وكفاءة أعلى.

**5. التقدم في الرعاية الصحية**
اكتشافات طبية جديدة وعلاجات مبتكرة للأمراض المزمنة.

**6. الفضاء واستكشاف الكواكب**
بعثات فضائية جديدة واكتشافات علمية هامة في مجال الفضاء.`,
      citations: [
        'https://example.com/tech-news-2024',
        'https://example.com/sports-updates',
        'https://example.com/economy-news',
        'https://example.com/renewable-energy',
        'https://example.com/healthcare-innovation',
        'https://example.com/space-exploration'
      ],
      newsItems: [
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
      ]
    },
    en: {
      content: `**1. Latest Technology Trends in 2024**
Technology has seen tremendous advancement this year with the emergence of generative AI and augmented reality technologies.

**2. Global Sports Events**
Major sports tournaments hosted with new record-breaking achievements across various sports.

**3. World Economic Changes**
Financial markets experienced volatility due to geopolitical changes and new monetary policies.

**4. Renewable Energy Innovations**
New developments in solar and wind power with lower costs and higher efficiency.

**5. Healthcare Progress**
New medical discoveries and innovative treatments for chronic diseases.

**6. Space and Planetary Exploration**
New space missions and important scientific discoveries in space exploration.`,
      citations: [
        'https://example.com/tech-trends-2024',
        'https://example.com/global-sports',
        'https://example.com/economic-changes',
        'https://example.com/renewable-energy',
        'https://example.com/healthcare-progress',
        'https://example.com/space-exploration'
      ],
      newsItems: [
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
      ]
    },
    de: {
      content: `**1. Neueste Technologietrends 2024**
Die Technologie hat dieses Jahr gewaltige Fortschritte gemacht mit dem Aufkommen von generativer KI und Augmented-Reality-Technologien.

**2. Globale Sportereignisse**
Große Sportturniere ausgerichtet mit neuen rekordbrechenden Leistungen in verschiedenen Sportarten.

**3. Weltwirtschaftliche Veränderungen**
Die Finanzmärkte erlebten Volatilität aufgrund geopolitischer Veränderungen und neuer Geldpolitiken.

**4. Innovationen bei erneuerbaren Energien**
Neue Entwicklungen bei Solar- und Windkraft mit geringeren Kosten und höherer Effizienz.

**5. Fortschritte im Gesundheitswesen**
Neue medizinische Entdeckungen und innovative Behandlungen für chronische Krankheiten.

**6. Weltraum- und Planetenerkundung**
Neue Weltraummissionen und wichtige wissenschaftliche Entdeckungen in der Weltraumerkundung.`,
      citations: [
        'https://example.com/tech-trends-2024',
        'https://example.com/global-sports',
        'https://example.com/economic-changes',
        'https://example.com/renewable-energy',
        'https://example.com/healthcare-progress',
        'https://example.com/space-exploration'
      ],
      newsItems: [
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
    }
  };
  
  return mockData[language] || mockData.en;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation
    const { query, searchType, language = 'en' } = body;

    // Validate query
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate query length (prevent abuse)
    const MAX_QUERY_LENGTH = 5000;
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate searchType
    const validSearchTypes = ['general', 'news', 'smart', 'discover', 'discover-images', 'lesson'];
    const safeSearchType = validSearchTypes.includes(searchType) ? searchType : 'general';

    // Validate language
    const validLanguages = ['ar', 'en', 'de'];
    const safeLanguage = validLanguages.includes(language) ? language : 'en';

    // Check if this is a simple conversational message
    if (!needsWebSearch(query)) {
      console.log('Conversational response for:', query);
      return new Response(
        JSON.stringify({
          success: true,
          content: getConversationalResponse(query, safeLanguage),
          citations: [],
          model: 'conversational',
          isConversational: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.log('PERPLEXITY_API_KEY not configured, returning mock data');
      
      // Return mock news data for discover functionality
      if (safeSearchType === 'discover' || safeSearchType === 'discover-images') {
        const mockNews = getMockNews(safeLanguage);
        return new Response(
          JSON.stringify({
            success: true,
            content: mockNews.content,
            citations: mockNews.citations,
            newsItems: mockNews.newsItems,
            model: 'mock',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching with Perplexity:', query.substring(0, 100), 'Type:', safeSearchType, 'Lang:', safeLanguage);

    // Language-specific system prompts
    const systemPrompts: Record<string, Record<string, string>> = {
      general: {
        ar: 'أنت مساعد بحث ذكي. قدم إجابات شاملة ودقيقة باللغة العربية. استخدم المصادر الموثوقة وقم بتنظيم الإجابة بشكل واضح مع عناوين فرعية عند الحاجة.',
        en: 'You are an intelligent search assistant. Provide comprehensive and accurate answers. Use reliable sources and organize the response clearly with subheadings when needed.',
        de: 'Sie sind ein intelligenter Suchassistent. Geben Sie umfassende und genaue Antworten auf Deutsch. Verwenden Sie zuverlässige Quellen und organisieren Sie die Antwort übersichtlich mit Unterüberschriften, wenn nötig.',
      },
      news: {
        ar: 'أنت مساعد أخبار ذكي. قدم آخر الأخبار والتحديثات باللغة العربية بشكل منظم. ركز على الأخبار الحديثة والمهمة مع ذكر المصادر.',
        en: 'You are an intelligent news assistant. Present the latest news and updates in an organized manner. Focus on recent and important news with source citations.',
        de: 'Sie sind ein intelligenter Nachrichtenassistent. Präsentieren Sie die neuesten Nachrichten und Updates auf Deutsch in organisierter Form. Konzentrieren Sie sich auf aktuelle und wichtige Nachrichten mit Quellenangaben.',
      },
      discover: {
        ar: 'قدم أهم 6 أخبار رائجة اليوم بشكل مختصر. لكل خبر: اكتب **العنوان** ثم ملخص قصير في سطر واحد. رتبها بالأرقام.',
        en: 'Present the top 6 trending news stories today briefly. For each story: write **Title** followed by a one-line summary. Number them.',
        de: 'Präsentieren Sie die 6 wichtigsten Nachrichten des Tages kurz. Für jede Nachricht: Schreiben Sie **Titel** gefolgt von einer einzeiligen Zusammenfassung. Nummerieren Sie sie.',
      },
      'discover-images': {
        ar: 'قدم أهم 8 أخبار عالمية رائجة اليوم. لكل خبر: اكتب **العنوان** ثم ملخص مختصر في جملتين. رتبها بالأرقام. ركز على الأخبار المتنوعة: سياسة، تقنية، رياضة، اقتصاد.',
        en: 'Present the top 8 trending global news stories today. For each story: write **Title** followed by a 2-sentence summary. Number them. Focus on diverse news: politics, tech, sports, economy.',
        de: 'Präsentieren Sie die 8 wichtigsten globalen Nachrichten des Tages. Für jede Nachricht: **Titel** gefolgt von einer 2-Satz-Zusammenfassung. Nummerieren Sie sie. Fokus auf verschiedene Themen: Politik, Technik, Sport, Wirtschaft.',
      },
      lesson: {
        ar: 'أنت مساعد تعليمي ذكي للطلاب. قدم شروحات واضحة ومفصلة باللغة العربية. استخدم أمثلة عملية، ونظم المعلومات بعناوين فرعية. ركز على الفهم العميق للموضوع. إذا تم إرفاق صور، قم بتحليلها وشرحها.',
        en: 'You are an intelligent educational assistant for students. Provide clear and detailed explanations. Use practical examples and organize information with subheadings. Focus on deep understanding of the topic. If images are attached, analyze and explain them.',
        de: 'Sie sind ein intelligenter Bildungsassistent für Schüler. Geben Sie klare und detaillierte Erklärungen auf Deutsch. Verwenden Sie praktische Beispiele und organisieren Sie Informationen mit Unterüberschriften. Konzentrieren Sie sich auf ein tiefes Verständnis des Themas. Wenn Bilder angehängt sind, analysieren und erklären Sie diese.',
      },
      smart: {
        ar: 'أنت مساعد ذكي متقدم. قدم إجابات شاملة ومنظمة بشكل احترافي. استخدم الجداول والقوائم والتنسيق المنظم. عند شرح اللغات أو المواضيع التعليمية، قدم جداول مقارنة وأمثلة عملية. استخدم التنسيق التالي: ## للعناوين الرئيسية، ### للعناوين الفرعية، | للجداول، - للقوائم النقطية، ** للتأكيد. كن دقيقاً وشاملاً في إجاباتك.',
        en: 'You are an advanced intelligent assistant. Provide comprehensive and professionally organized answers. Use tables, lists, and structured formatting. When explaining languages or educational topics, provide comparison tables and practical examples. Use this formatting: ## for main headings, ### for subheadings, | for tables, - for bullet points, ** for emphasis. Be precise and comprehensive in your answers.',
        de: 'Sie sind ein fortschrittlicher intelligenter Assistent. Geben Sie umfassende und professionell organisierte Antworten. Verwenden Sie Tabellen, Listen und strukturierte Formatierung. Bei der Erklärung von Sprachen oder Bildungsthemen stellen Sie Vergleichstabellen und praktische Beispiele bereit. Verwenden Sie diese Formatierung: ## für Hauptüberschriften, ### für Unterüberschriften, | für Tabellen, - für Aufzählungszeichen, ** für Betonungen. Seien Sie präzise und umfassend in Ihren Antworten.',
      },
    };

    const systemPrompt = systemPrompts[safeSearchType]?.[safeLanguage] || systemPrompts.general.en;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        search_recency_filter: (safeSearchType === 'news' || safeSearchType === 'discover' || safeSearchType === 'discover-images') ? 'day' : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Perplexity API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error?.message || 'Search failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search successful');
    
    return new Response(
      JSON.stringify({
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        citations: data.citations || [],
        model: data.model,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to search';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
