# تعليمات المشروع - محرك البحث الذكي

## نظرة عامة

مشروع **محرك بحث ذكي** مبني بـ React + Vite يوفر:
- بحث ذكي باستخدام Perplexity API
- واجهة محادثة مستمرة (ChatGPT-like)
- وضع الدرس (Lesson Mode) للدراسة
- دعم متعدد اللغات (عربي/إنجليزي/ألماني)
- Dark Mode
- إدارة الدروس المحفوظة عبر Supabase

## البنية

```
src/
  ├── components/          # مكونات React
  │   ├── search/          # مكونات البحث
  │   ├── ui/              # مكونات shadcn-ui
  │   └── ...
  ├── pages/               # صفحات التطبيق
  │   ├── Index.tsx        # الصفحة الرئيسية
  │   ├── Discover.tsx     # صفحة الاكتشاف
  │   └── NotFound.tsx     # 404
  ├── hooks/               # Custom hooks
  │   ├── usePerplexitySearch.ts
  │   ├── useLessons.ts
  │   └── useImageUpload.ts
  ├── lib/                 # مكتبات مساعدة
  │   ├── api/             # APIs (Perplexity)
  │   ├── i18n/            # الترجمة
  │   └── utils.ts
  └── integrations/        # تكاملات خارجية
      └── supabase/        # Supabase client

supabase/
  ├── functions/           # Edge Functions
  └── migrations/          # Migrations
```

## المكتبات الرئيسية

### Core
- **React 18** - مكتبة UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn-ui** - مكونات UI جاهزة
- **lucide-react** - أيقونات
- **next-themes** - Dark mode

### State & Data
- **Supabase** - Backend (Database + Auth + Storage)
- **@tanstack/react-query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Features
- **Perplexity API** - البحث الذكي
- **i18n** - دعم متعدد اللغات

## خطوات البناء والتشغيل

### التثبيت
```bash
npm install
# أو
bun install
```

### التطوير
```bash
npm run dev
# يعمل على http://localhost:5173
```

### البناء
```bash
npm run build
npm run preview  # معاينة production build
```

### Linting
```bash
npm run lint
```

## معايير الكود

### React
- ✅ استخدم functional components فقط
- ✅ استخدم hooks بشكل صحيح (useEffect, useMemo, useCallback)
- ✅ استخدم named exports
- ✅ تجنب prop drilling - استخدم Context API
- ✅ استخدم TypeScript types على جميع props

### TypeScript
- ✅ استخدم strict mode
- ✅ تجنب `any` - استخدم `unknown` أو types محددة
- ✅ أضف JSDoc للدوال العامة
- ✅ استخدم interfaces للـ props

### Styling
- ✅ استخدم Tailwind CSS classes
- ✅ استخدم `cn()` من `@/lib/utils` لدمج classes
- ✅ استخدم CSS variables للثيمات

### File Structure
- ✅ مكون واحد لكل ملف
- ✅ أسماء الملفات: PascalCase للمكونات، camelCase للـ hooks/utils
- ✅ استخدم absolute imports (`@/components/...`)

## الميزات الرئيسية

### 1. البحث الذكي
- **General Search**: بحث عام
- **News Search**: بحث الأخبار
- **Smart Answer**: إجابات ذكية متقدمة
- **Lesson Mode**: وضع دراسي متخصص

### 2. المحادثة المستمرة
- حفظ الرسائل في localStorage
- استمرار المحادثة بعد refresh
- سياق المحادثة (context awareness)

### 3. إدارة الدروس
- حفظ الدروس في Supabase
- عرض قائمة الدروس
- حذف/تعديل الدروس

### 4. رفع الصور
- رفع صور للبحث
- عرض الصور المرفوعة
- دعم متعدد الصور

## Environment Variables

أنشئ ملف `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Supabase Setup

1. أنشئ مشروع Supabase
2. انسخ URL و Anon Key
3. شغّل migrations:
```bash
npx supabase db push
```

## API Integration

### Perplexity API
- Edge Function في `supabase/functions/perplexity-search/`
- استدعاء من `src/lib/api/perplexity.ts`

## الاختبار

```bash
# اختبارات (إذا أضفتها)
npm test
```

## النشر

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Lovable**: من واجهة Lovable مباشرة

## ملاحظات مهمة

- ⚠️ لا تنسَ إضافة `.env.local` إلى `.gitignore`
- ⚠️ تأكد من إعداد Supabase Edge Functions قبل الاستخدام
- ⚠️ Perplexity API يحتاج API key صالح

