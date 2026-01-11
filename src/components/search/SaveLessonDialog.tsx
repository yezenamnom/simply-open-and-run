import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { X, Image as ImageIcon } from 'lucide-react';

interface SaveLessonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  query: string;
  images: string[];
}

export const SaveLessonDialog = ({
  open,
  onClose,
  onSave,
  query,
  images,
}: SaveLessonDialogProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(query.substring(0, 50));

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.saveLesson}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.lessonTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.enterLessonTitle}
              dir="auto"
            />
          </div>
          {images.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t.attachedImages} ({images.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
