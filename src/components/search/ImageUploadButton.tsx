import { useRef } from 'react';
import { ImagePlus, X, Loader2, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { ImageWithAnalysis } from '@/hooks/useImageUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploadButtonProps {
  onUpload: (file: File) => Promise<string | null>;
  uploadedImages: string[];
  onRemove: (url: string) => void;
  uploading: boolean;
  analyzing?: boolean;
  imagesWithAnalysis?: ImageWithAnalysis[];
  disabled?: boolean;
}

export const ImageUploadButton = ({
  onUpload,
  uploadedImages,
  onRemove,
  uploading,
  analyzing = false,
  imagesWithAnalysis = [],
  disabled,
}: ImageUploadButtonProps) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={disabled || uploading || analyzing}
        className="h-9 w-9"
        title={analyzing ? 'جاري التحليل...' : t.uploadImage}
      >
        {uploading || analyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
      </Button>
      
      {uploadedImages.length > 0 && (
        <div className="space-y-3 mt-2">
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((url, idx) => {
              const imageData = imagesWithAnalysis.find(img => img.url === url);
              const analysis = imageData?.analysis;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="relative group w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => onRemove(url)}
                      className={cn(
                        "absolute top-0.5 right-0.5 p-0.5 rounded-full",
                        "bg-destructive text-destructive-foreground",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {analysis?.success && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs p-1 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        <span>محللة</span>
                      </div>
                    )}
                  </div>
                  {analysis?.success && analysis.description && (
                    <Alert className="w-20 text-xs p-2">
                      <Sparkles className="h-3 w-3" />
                      <AlertDescription className="text-xs line-clamp-2">
                        {analysis.description}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
