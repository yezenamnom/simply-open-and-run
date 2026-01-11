import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { WorkflowPlan, WorkflowNode } from './WorkflowBuilder';
import { perplexityApi } from '@/lib/api/perplexity';
import { aiProviderService, AIProvider, AI_PROVIDERS } from '@/lib/api/aiProviders';
import { whatsappService } from '@/lib/api/whatsapp';
import { calendarService } from '@/lib/api/calendar';
import { telegramApi } from '@/lib/api/telegram';
import { emailApi } from '@/lib/api/email';
import { pdfApi } from '@/lib/api/pdf';
import { useLessons } from '@/hooks/useLessons';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkflowExecutorProps {
  workflow: WorkflowPlan;
  onClose?: () => void;
}

interface ExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
}

export const WorkflowExecutor = ({ workflow, onClose }: WorkflowExecutorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionStates, setExecutionStates] = useState<Map<string, ExecutionState>>(new Map());
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // بناء خريطة الاتصالات (دعم multiple outputs)
  const buildGraph = useCallback(() => {
    const forwardGraph = new Map<string, string[]>(); // source -> targets[]
    const backwardGraph = new Map<string, string[]>(); // target -> sources[]
    
    workflow.edges.forEach((edge) => {
      // Forward connections
      if (!forwardGraph.has(edge.source)) {
        forwardGraph.set(edge.source, []);
      }
      forwardGraph.get(edge.source)!.push(edge.target);
      
      // Backward connections
      if (!backwardGraph.has(edge.target)) {
        backwardGraph.set(edge.target, []);
      }
      backwardGraph.get(edge.target)!.push(edge.source);
    });
    
    return { forwardGraph, backwardGraph };
  }, [workflow]);

  // الحصول على جميع العقد التالية (دعم multiple outputs)
  const getNextNodes = useCallback((nodeId: string, graph: Map<string, string[]>): string[] => {
    return graph.get(nodeId) || [];
  }, []);

  // تنفيذ جميع العقد التالية بشكل متوازي
  const executeNextNodes = useCallback(async (
    nodeIds: string[],
    graph: Map<string, string[]>,
    states: Map<string, ExecutionState>,
    previousContent: string
  ): Promise<void> => {
    // تنفيذ جميع العقد التالية بشكل متوازي
    await Promise.all(
      nodeIds.map(async (nextNodeId) => {
        const nextNode = workflow.nodes.find((n) => n.id === nextNodeId);
        if (!nextNode || nextNode.type === 'end') return;

        // جمع المحتوى من جميع العقد السابقة
        const allPreviousContent = collectPreviousContent(nextNodeId, graph, states);
        const combinedInput = allPreviousContent || previousContent;

        // تنفيذ العقدة
        await executeNode(nextNode, combinedInput);

        // الحصول على العقد التالية لهذه العقدة
        const furtherNodes = getNextNodes(nextNodeId, graph);
        if (furtherNodes.length > 0) {
          const nodeState = states.get(nextNodeId);
          await executeNextNodes(furtherNodes, graph, states, nodeState?.result || '');
        }
      })
    );
  }, [workflow, collectPreviousContent, executeNode, getNextNodes]);

  // جمع المحتوى من جميع العقد السابقة (دعم multiple inputs)
  const collectPreviousContent = useCallback((
    nodeId: string, 
    backwardGraph: Map<string, string[]>, 
    states: Map<string, ExecutionState>
  ): string => {
    const previousNodes = backwardGraph.get(nodeId) || [];

    if (previousNodes.length === 0) {
      return '';
    }

    // إذا كان هناك عقدة واحدة فقط، نعيد محتواها مباشرة
    if (previousNodes.length === 1) {
      const state = states.get(previousNodes[0]);
      return state?.result || '';
    }

    // إذا كان هناك عدة عقد، نجمع محتواها مع تسمية كل واحدة
    const contents: string[] = [];
    previousNodes.forEach((prevId, index) => {
      const state = states.get(prevId);
      const prevNode = workflow.nodes.find(n => n.id === prevId);
      if (state?.result) {
        const label = prevNode?.data?.label || `Input ${index + 1}`;
        contents.push(`[${label}]:\n${state.result}`);
      }
    });

    return contents.join('\n\n---\n\n');
  }, [workflow]);

  // تنفيذ AI Agent
  const executeAIAgent = useCallback(async (node: WorkflowNode, input: string): Promise<string> => {
    const { aiPrompt, aiType, aiConfig } = node.data;

    if (!aiPrompt) {
      throw new Error('الـ prompt غير محدد');
    }

    let finalPrompt = aiPrompt;

    // إضافة المحتوى السابق للـ prompt
    if (input) {
      finalPrompt = `${aiPrompt}\n\nالمحتوى السابق:\n${input}`;
    }

    // بناء الـ prompt حسب نوع الـ agent
    switch (aiType || node.type) {
      case 'ai-research':
        finalPrompt = `ابحث عن: ${finalPrompt}`;
        break;
      case 'ai-summarize':
        finalPrompt = `لخص المحتوى التالي:\n${input || 'لا يوجد محتوى سابق'}\n\nالتعليمات: ${aiPrompt}`;
        break;
      case 'ai-generate':
        finalPrompt = `أنشئ محتوى عن: ${finalPrompt}`;
        break;
      case 'ai-analyze':
        finalPrompt = `حلل المحتوى التالي:\n${input || 'لا يوجد محتوى سابق'}\n\nالتعليمات: ${aiPrompt}`;
        break;
      case 'ai-study':
        finalPrompt = `ادرس وحلل المحتوى التالي بعمق:\n${input || 'لا يوجد محتوى سابق'}\n\nقم بـ:\n1. تلخيص النقاط الرئيسية\n2. تحليل المفاهيم الأساسية\n3. تحديد العلاقات بين الأفكار\n4. اقتراح أسئلة للتفكير\n\nالتعليمات الإضافية: ${aiPrompt}`;
        break;
    }

    // استخدام AI Provider المحدد
    const provider = (aiConfig?.provider || 'openrouter') as AIProvider;
    
    // استخدام API Key من العقدة إذا كان موجوداً، وإلا من الإعدادات
    let apiKey = aiConfig?.apiKey;
    if (!apiKey) {
      const config = aiProviderService.getConfig(provider);
      if (!config || !config.enabled || !config.apiKey) {
        throw new Error(`Provider ${provider} is not configured. Please set up API key in settings or in the node.`);
      }
      apiKey = config.apiKey;
    }

    const model = aiConfig?.model || AI_PROVIDERS[provider]?.models[0]?.id || 'openai/gpt-4-turbo';

    try {
      // محاولة استخدام AI Provider المحدد
      if (provider !== 'perplexity') {
        const result = await aiProviderService.callAPIWithKey(
          provider,
          model,
          finalPrompt,
          apiKey,
          {
            temperature: aiConfig?.temperature,
            maxTokens: aiConfig?.maxTokens,
            systemPrompt: aiConfig?.systemPrompt,
          }
        );
        return result;
      }
    } catch (error) {
      console.warn(`Failed to use ${provider}, falling back to Perplexity:`, error);
    }

    // Fallback إلى Perplexity
    const searchType = aiConfig?.searchType || 'smart';
    const result = await perplexityApi.search(finalPrompt, searchType, language);

    if (!result.success || !result.content) {
      throw new Error(result.error || 'فشل تنفيذ AI Agent');
    }

    return result.content;
  }, [language]);

  // تنفيذ عقدة واحدة
  const executeNode = useCallback(async (node: WorkflowNode, previousContent: string): Promise<string> => {
    setCurrentNodeId(node.id);
    setExecutionStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(node.id, { nodeId: node.id, status: 'running' });
      return newMap;
    });

    try {
      let result = '';

      // تنفيذ حسب نوع العقدة
      if (node.type === 'lesson-connector') {
        result = await executeLessonConnector(node);
      } else if (node.type.startsWith('ai-')) {
        result = await executeAIAgent(node, previousContent);
      } else if (node.type === 'whatsapp') {
        await executeWhatsApp(node, previousContent);
        result = `تم إرسال رسالة WhatsApp إلى ${node.data.whatsappNumber}`;
      } else if (node.type === 'telegram') {
        await executeTelegram(node, previousContent);
        result = `تم إرسال رسالة Telegram إلى ${node.data.telegramChatId}`;
      } else if (node.type === 'email') {
        await executeEmail(node, previousContent);
        result = `تم إرسال بريد إلكتروني إلى ${node.data.emailTo}`;
      } else if (node.type === 'pdf-export') {
        result = await executePDF(node, previousContent);
      } else if (node.type === 'calendar') {
        const eventId = await executeCalendar(node);
        result = `تم إنشاء حدث في التقويم: ${eventId}`;
      } else {
        // للعقد العادية، نستخدم المحتوى الموجود أو نولد محتوى بسيط
        result = node.data.content || node.data.description || `تم تنفيذ: ${node.data.label}`;
      }

      setExecutionStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(node.id, { nodeId: node.id, status: 'completed', result });
        return newMap;
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setExecutionStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(node.id, { nodeId: node.id, status: 'error', error: errorMessage });
        return newMap;
      });
      throw error;
    }
  }, [executeAIAgent, executeLessonConnector, executeWhatsApp, executeTelegram, executeEmail, executePDF, executeCalendar]);

  // تنفيذ الـ workflow بالكامل
  const executeWorkflow = useCallback(async () => {
    setIsRunning(true);
    setExecutionStates(new Map());
    setCurrentNodeId(null);

    try {
      const { forwardGraph, backwardGraph } = buildGraph();
      const startNode = workflow.nodes.find((n) => n.type === 'start');
      
      if (!startNode) {
        throw new Error('لا توجد عقدة بداية');
      }

      // تنفيذ عقدة البداية
      await executeNode(startNode, '');

      // الحصول على جميع العقد التالية للبداية
      const nextNodes = getNextNodes(startNode.id, forwardGraph);
      
      if (nextNodes.length > 0) {
        const startState = executionStates.get(startNode.id);
        await executeNextNodes(nextNodes, forwardGraph, executionStates, startState?.result || '');
      }

      toast({
        title: 'نجح التنفيذ',
        description: 'تم تنفيذ المخطط الدراسي بنجاح',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل تنفيذ المخطط';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
      setCurrentNodeId(null);
    }
  }, [workflow, buildGraph, getNextNodes, executeNextNodes, executeNode, toast]);

  const getNodeStatus = (nodeId: string): ExecutionState | undefined => {
    return executionStates.get(nodeId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{workflow.title}</h2>
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={executeWorkflow}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التنفيذ...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                تنفيذ المخطط
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {workflow.nodes.map((node) => {
          const status = getNodeStatus(node.id);
          const isCurrent = currentNodeId === node.id;

          return (
            <Card
              key={node.id}
              className={cn(
                'p-4 transition-all',
                isCurrent && 'ring-2 ring-primary',
                status?.status === 'completed' && 'bg-green-50 dark:bg-green-950/20',
                status?.status === 'error' && 'bg-red-50 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {status?.status === 'running' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {status?.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {status?.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {!status && (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="font-semibold">{node.data.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{node.type}</span>
              </div>

              {node.data.description && (
                <p className="text-sm text-muted-foreground mb-2">{node.data.description}</p>
              )}

              {status?.result && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-1">النتيجة:</p>
                  <p className="text-sm whitespace-pre-wrap">{status.result.substring(0, 500)}...</p>
                </div>
              )}

              {status?.error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">خطأ:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{status.error}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

