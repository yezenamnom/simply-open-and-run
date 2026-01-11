import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Brain } from "lucide-react";

interface ThinkDeeperButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ThinkDeeperButton = ({ onClick, disabled = false }: ThinkDeeperButtonProps) => {
  const { t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-2 mt-4 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
    >
      <Brain className="h-4 w-4" />
      {t.thinkDeeper}
    </Button>
  );
};
