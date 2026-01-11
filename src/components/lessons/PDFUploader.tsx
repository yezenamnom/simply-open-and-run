import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface PDFUploaderProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  variant?: 'icon' | 'full';
}

export const PDFUploader = ({ onUpload, disabled, variant = 'full' }: PDFUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'خطأ',
        description: 'يرجى رفع ملف PDF فقط',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'خطأ',
        description: 'حجم الملف كبير جداً (الحد الأقصى 10MB)',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      await onUpload(file);
      toast({
        title: 'نجح الرفع',
        description: 'تم رفع ملف PDF بنجاح',
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع ملف PDF',
        variant: 'destructive',
      });
      setUploadedFile(null);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn(variant === 'icon' ? "" : "space-y-2")}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!uploadedFile ? (
        <Button
          type="button"
          variant="outline"
          size={variant === 'icon' ? 'icon' : 'sm'}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(variant === 'icon' ? "h-9 w-9" : "w-full gap-2")}
          title={uploading ? 'جاري الرفع...' : 'رفع ملف PDF'}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {variant === 'full' && (uploading ? 'جاري الرفع...' : 'رفع ملف PDF')}
        </Button>
      ) : variant === 'icon' ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1">
            <FileText className="h-4 w-4 text-primary" />
            <div className="text-xs max-w-[140px] truncate">{uploadedFile.name}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-9 w-9"
            title="إزالة ملف PDF"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted">
          <FileText className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{uploadedFile.name}</div>
            <div className="text-xs text-muted-foreground">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

