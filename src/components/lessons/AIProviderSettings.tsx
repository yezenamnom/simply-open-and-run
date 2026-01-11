import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Settings, Key, CheckCircle2, XCircle, Brain } from 'lucide-react';
import { AIProvider, AIProviderConfig, AI_PROVIDERS, aiProviderService } from '@/lib/api/aiProviders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIProviderSettingsProps {
  onConfigChange?: (configs: AIProviderConfig[]) => void;
}

export const AIProviderSettings = ({ onConfigChange }: AIProviderSettingsProps) => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<AIProviderConfig>>({});
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const loaded = aiProviderService.getAllConfigs();
    setConfigs(loaded);
  };

  const handleSaveConfig = () => {
    if (!editingProvider) return;

    const config: AIProviderConfig = {
      provider: editingProvider,
      apiKey: editingConfig.apiKey || '',
      baseURL: editingConfig.baseURL,
      defaultModel: editingConfig.defaultModel,
      enabled: editingConfig.enabled ?? true,
    };

    if (!config.apiKey) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال API Key',
        variant: 'destructive',
      });
      return;
    }

    aiProviderService.setConfig(config);
    loadConfigs();
    setShowDialog(false);
    setEditingProvider(null);
    setEditingConfig({});

    toast({
      title: 'تم الحفظ',
      description: `تم حفظ إعدادات ${AI_PROVIDERS[editingProvider].name} بنجاح`,
    });

    if (onConfigChange) {
      onConfigChange(aiProviderService.getAllConfigs());
    }
  };

  const handleEdit = (provider: AIProvider) => {
    const existing = configs.find(c => c.provider === provider);
    setEditingProvider(provider);
    setEditingConfig(existing || { provider, enabled: true });
    setShowDialog(true);
  };

  const handleDelete = (provider: AIProvider) => {
    const newConfigs = configs.filter(c => c.provider !== provider);
    localStorage.setItem('ai_provider_configs', JSON.stringify(newConfigs));
    loadConfigs();
    
    toast({
      title: 'تم الحذف',
      description: `تم حذف إعدادات ${AI_PROVIDERS[provider].name}`,
    });

    if (onConfigChange) {
      onConfigChange(newConfigs);
    }
  };

  const handleToggle = (provider: AIProvider) => {
    const config = configs.find(c => c.provider === provider);
    if (config) {
      const updated = { ...config, enabled: !config.enabled };
      aiProviderService.setConfig(updated);
      loadConfigs();
      
      if (onConfigChange) {
        onConfigChange(aiProviderService.getAllConfigs());
      }
    }
  };

  const getProviderStatus = (provider: AIProvider) => {
    const config = configs.find(c => c.provider === provider);
    if (!config) return 'not-configured';
    if (!config.enabled) return 'disabled';
    if (!config.apiKey) return 'no-key';
    return 'ready';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">إعدادات AI Providers</h3>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              إضافة Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? `تعديل ${AI_PROVIDERS[editingProvider].name}` : 'إضافة AI Provider'}
              </DialogTitle>
            </DialogHeader>
            {editingProvider && (
              <div className="space-y-4">
                <div>
                  <Label>Provider</Label>
                  <Select
                    value={editingProvider}
                    onValueChange={(value) => setEditingProvider(value as AIProvider)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={editingConfig.apiKey || ''}
                    onChange={(e) => setEditingConfig({ ...editingConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>

                {editingProvider === 'custom' && (
                  <div>
                    <Label htmlFor="baseURL">Base URL</Label>
                    <Input
                      id="baseURL"
                      value={editingConfig.baseURL || ''}
                      onChange={(e) => setEditingConfig({ ...editingConfig, baseURL: e.target.value })}
                      placeholder="https://api.example.com"
                    />
                  </div>
                )}

                <div>
                  <Label>النموذج الافتراضي</Label>
                  <Select
                    value={editingConfig.defaultModel || ''}
                    onValueChange={(value) => setEditingConfig({ ...editingConfig, defaultModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النموذج" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS[editingProvider].models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">مفعّل</Label>
                  <Switch
                    id="enabled"
                    checked={editingConfig.enabled ?? true}
                    onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, enabled: checked })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveConfig}>
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(AI_PROVIDERS).map(([key, provider]) => {
          const status = getProviderStatus(key as AIProvider);
          const config = configs.find(c => c.provider === key as AIProvider);

          return (
            <Card key={key} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {provider.models.length} نموذج متاح
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'ready' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {status === 'disabled' && (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {status === 'not-configured' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              {config && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الحالة:</span>
                    <span className={cn(
                      config.enabled ? 'text-green-600' : 'text-gray-400'
                    )}>
                      {config.enabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>
                  {config.defaultModel && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">النموذج:</span>
                      <span className="font-medium">
                        {provider.models.find(m => m.id === config.defaultModel)?.name || config.defaultModel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                {config && (
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={() => handleToggle(key as AIProvider)}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(key as AIProvider)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {config ? 'تعديل' : 'إعداد'}
                </Button>
                {config && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(key as AIProvider)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

