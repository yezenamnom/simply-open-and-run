import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClaudeModelSelection, usePuterClaudeModels } from '@/hooks/usePuter';

interface ClaudeModelSelectorProps {
  className?: string;
}

export const ClaudeModelSelector = ({ className }: ClaudeModelSelectorProps) => {
  const { selectedModel, setSelectedModel } = useClaudeModelSelection();
  const { isReady, models } = usePuterClaudeModels();

  // If models loaded and selected model isn't in the list, pick the first one
  useEffect(() => {
    if (!isReady) return;
    if (models.length === 0) return;
    if (models.includes(selectedModel)) return;
    setSelectedModel(models[0]);
  }, [isReady, models, selectedModel, setSelectedModel]);

  if (!isReady) return null;

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className={className ?? 'h-9 w-[180px]'}>
        <SelectValue placeholder="Claude model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

