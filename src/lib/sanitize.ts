import DOMPurify from 'dompurify';

// Configure DOMPurify with safe defaults
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
  'a'
];

const ALLOWED_ATTR = [
  'class',
  'dir',
  'style',
  'href',
  'target',
  'rel'
];

// Sanitize HTML content to prevent XSS attacks
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // Allow target attribute for links
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

// Format markdown-like content to HTML with sanitization
export function formatContent(content: string): string {
  // Convert markdown-like formatting to HTML with enhanced table support
  let html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-3 mt-4 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-4 mt-6 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-5 mt-8 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-foreground">$1</em>')
    // Tables - Enhanced support
    .replace(/\|(.+)\|/g, (match, tableContent) => {
      const cells = tableContent.split('|').map((cell: string) => cell.trim());
      const isHeader = match.includes('---') || cells.some((cell: string) => cell.includes('**'));
      
      if (isHeader) {
        const headerCells = cells.map((cell: string) => 
          `<th class="px-4 py-3 text-right font-semibold text-sm bg-muted/50 border border-border">${cell.replace(/\*\*/g, '')}</th>`
        ).join('');
        return `<table class="w-full border-collapse border border-border rounded-lg overflow-hidden mb-6 shadow-sm"><thead><tr>${headerCells}</tr></thead><tbody>`;
      }
      
      const dataCells = cells.map((cell: string) => 
        `<td class="px-4 py-3 text-right text-sm border border-border bg-card">${cell}</td>`
      ).join('');
      return `<tr class="hover:bg-muted/30 transition-colors">${dataCells}</tr>`;
    })
    // Close table tags
    .replace(/<tbody><tr>/g, '</tbody><tbody><tr>')
    .replace(/<tbody>$/, '</tbody></table>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="mb-2 flex items-start"><span class="text-primary mr-2">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="mb-2 flex items-start"><span class="text-primary mr-2 font-semibold">$1.</span><span>$2</span></li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraph
  html = `<p class="text-foreground leading-relaxed mb-4">${html}</p>`;
  
  // Fix list items
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul class="space-y-2 mb-4">${match}</ul>`);
  
  // Clean up table structure
  html = html.replace(/<table>.*?<\/table>/gs, (match) => {
    return match.replace(/<p class="text-foreground leading-relaxed mb-4">/g, '').replace(/<\/p>/g, '');
  });
  
  // Sanitize the final HTML to prevent XSS
  return sanitizeHtml(html);
}

// Simple format for lesson view
export function formatLessonContent(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  html = `<p>${html}</p>`;
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);
  
  // Sanitize the final HTML to prevent XSS
  return sanitizeHtml(html);
}

// Format summary content
export function formatSummaryContent(content: string): string {
  const html = content.replace(/\n/g, '<br/>');
  return sanitizeHtml(html);
}
