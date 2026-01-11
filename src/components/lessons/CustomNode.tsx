import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { 
  Play, 
  FileText, 
  Video, 
  Target, 
  CheckCircle2, 
  Link, 
  Clock, 
  Brain, 
  Zap, 
  MessageSquare, 
  Calendar, 
  GraduationCap,
  Sparkles,
  Send,
  Mail,
  Download,
  BookOpen,
  CreditCard,
  StickyNote,
  Timer,
  Coffee,
  Network,
  FileQuestion,
  BookMarked,
  PenTool,
  FileCheck,
  Presentation,
  Mic,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Languages,
  Calculator,
  Search,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface CustomNodeProps extends NodeProps {
  data: any;
  selected?: boolean;
}

export const CustomNode = ({ data, selected, type, ...props }: CustomNodeProps) => {
  const nodeType = type || 'default';
  const isAIAgent = nodeType.startsWith('ai-');
  const isCircular = isAIAgent;
  const getNodeStyle = () => {
    const baseStyles = 'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] relative';
    
    switch (nodeType) {
      case 'start':
        return cn(baseStyles, 'bg-gradient-to-br from-green-500 to-green-600 text-white');
      case 'end':
        return cn(baseStyles, 'bg-gradient-to-br from-red-500 to-red-600 text-white');
      case 'topic':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-blue-500');
      case 'video':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-red-500');
      case 'quiz':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-yellow-500');
      case 'assignment':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-green-500');
      case 'resource':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-purple-500');
      case 'break':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-gray-400');
      case 'ai-research':
        return cn(baseStyles, 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]');
      case 'ai-summarize':
        return cn(baseStyles, 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]');
      case 'ai-generate':
        return cn(baseStyles, 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400 text-white shadow-lg rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]');
      case 'ai-analyze':
        return cn(baseStyles, 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 text-white shadow-lg rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]');
      case 'ai-study':
        return cn(baseStyles, 'bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400 text-white shadow-lg rounded-full aspect-square flex items-center justify-center min-w-[120px] min-h-[120px]');
      case 'whatsapp':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20');
      case 'calendar':
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20');
      default:
        return cn(baseStyles, 'bg-white dark:bg-gray-800 border-gray-500');
    }
  };

  const isStartOrEnd = nodeType === 'start' || nodeType === 'end';

  const getNodeIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'start':
        return <Play className={iconClass} />;
      case 'end':
        return <GraduationCap className={iconClass} />;
      case 'topic':
        return <FileText className={cn(iconClass, "text-blue-500")} />;
      case 'video':
        return <Video className={cn(iconClass, "text-red-500")} />;
      case 'quiz':
        return <Target className={cn(iconClass, "text-yellow-500")} />;
      case 'assignment':
        return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
      case 'resource':
        return <Link className={cn(iconClass, "text-purple-500")} />;
      case 'break':
        return <Clock className={cn(iconClass, "text-gray-500")} />;
      case 'ai-research':
        return <Brain className={cn(iconClass, "text-white")} />;
      case 'ai-summarize':
        return <FileText className={cn(iconClass, "text-white")} />;
      case 'ai-generate':
        return <Zap className={cn(iconClass, "text-white")} />;
      case 'ai-analyze':
        return <Target className={cn(iconClass, "text-white")} />;
      case 'ai-study':
        return <BookOpen className={cn(iconClass, "text-white")} />;
      case 'whatsapp':
        return <MessageSquare className={cn(iconClass, "text-green-500")} />;
      case 'calendar':
        return <Calendar className={cn(iconClass, "text-blue-500")} />;
      case 'ai-study':
        return <BookOpen className={cn(iconClass, "text-purple-500")} />;
      case 'telegram':
        return <Send className={cn(iconClass, "text-blue-500")} />;
      case 'email':
        return <Mail className={cn(iconClass, "text-red-500")} />;
      case 'pdf-export':
        return <Download className={cn(iconClass, "text-orange-500")} />;
      case 'lesson-connector':
        return <BookOpen className={cn(iconClass, "text-purple-500")} />;
      case 'flashcards':
        return <CreditCard className={cn(iconClass, "text-purple-500")} />;
      case 'notes':
        return <StickyNote className={cn(iconClass, "text-yellow-500")} />;
      case 'timer':
        return <Timer className={cn(iconClass, "text-orange-500")} />;
      case 'pomodoro':
        return <Coffee className={cn(iconClass, "text-red-500")} />;
      case 'mindmap':
        return <Network className={cn(iconClass, "text-indigo-500")} />;
      case 'quiz-generator':
        return <FileQuestion className={cn(iconClass, "text-teal-500")} />;
      case 'bookmark':
        return <BookMarked className={cn(iconClass, "text-blue-500")} />;
      case 'highlighter':
        return <PenTool className={cn(iconClass, "text-pink-500")} />;
      case 'summary':
        return <FileCheck className={cn(iconClass, "text-violet-500")} />;
      case 'presentation':
        return <Presentation className={cn(iconClass, "text-amber-500")} />;
      case 'recording':
        return <Mic className={cn(iconClass, "text-green-500")} />;
      case 'image-analyzer':
        return <ImageIcon className={cn(iconClass, "text-cyan-500")} />;
      case 'video-analyzer':
        return <VideoIcon className={cn(iconClass, "text-red-500")} />;
      case 'audio-transcriber':
        return <Music className={cn(iconClass, "text-purple-500")} />;
      case 'translator':
        return <Languages className={cn(iconClass, "text-blue-500")} />;
      case 'calculator':
        return <Calculator className={cn(iconClass, "text-gray-500")} />;
      case 'research':
        return <Search className={cn(iconClass, "text-teal-500")} />;
      case 'idea-generator':
        return <Lightbulb className={cn(iconClass, "text-yellow-500")} />;
      case 'progress-tracker':
        return <TrendingUp className={cn(iconClass, "text-green-500")} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <div className={cn(
      getNodeStyle(), 
      selected && 'ring-2 ring-primary ring-offset-2',
      'group relative'
    )}>
      {/* Input Handles - أعلى العقدة */}
      {nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
          style={{ top: -6 }}
        />
      )}

      {/* Output Handles - أسفل العقدة */}
      {nodeType !== 'end' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="output-1"
            className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
            style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
          />
          {/* Handle إضافي للاتصالات المتعددة */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="output-2"
            className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
            style={{ bottom: -6, left: '30%', transform: 'translateX(-50%)' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="output-3"
            className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
            style={{ bottom: -6, left: '70%', transform: 'translateX(-50%)' }}
          />
        </>
      )}

      {/* Side Handles للاتصالات الجانبية */}
      {nodeType !== 'start' && nodeType !== 'end' && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="input-left"
            className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
            style={{ left: -6 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="output-right"
            className="!bg-primary !border-2 !border-white dark:!border-gray-800 !w-3 !h-3"
            style={{ right: -6 }}
          />
        </>
      )}

      {/* محتوى العقدة */}
      <div className="pointer-events-none flex flex-col items-center justify-center p-4">
        {isCircular ? (
          // تصميم دائري للـ AI Agents
          <>
            <div className="mb-2">
              {getNodeIcon(nodeType)}
            </div>
            {data.label && (
              <div className="font-semibold text-sm text-center">
                {data.label}
              </div>
            )}
            {data.description && (
              <div className="text-xs text-muted-foreground text-center mt-1 max-w-[100px] truncate">
                {data.description}
              </div>
            )}
          </>
        ) : (
          // تصميم مستطيل للعناصر العادية
          <>
            <div className="flex items-center gap-2 mb-1">
              {getNodeIcon(nodeType)}
              {data.label && (
                <div className="font-semibold text-sm">
                  {data.label}
                </div>
              )}
            </div>
        {data.description && (
          <p className={cn(
            "text-xs mt-1",
            isStartOrEnd ? "opacity-90" : "text-gray-600 dark:text-gray-400"
          )}>
            {data.description}
          </p>
        )}
        {data.duration && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{data.duration} دقيقة</span>
          </div>
        )}
        {(nodeType.startsWith('ai-')) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" />
            <span>AI Agent</span>
          </div>
        )}
          </>
        )}
      </div>

      {/* زر الحذف - يظهر دائماً في الزاوية */}
      <button
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center z-10 pointer-events-auto transition-all shadow-lg opacity-0 group-hover:opacity-100 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          // سيتم التعامل مع الحذف في WorkflowBuilder
          const deleteEvent = new CustomEvent('deleteNode', { detail: { nodeId: props.id } });
          window.dispatchEvent(deleteEvent);
        }}
        title="حذف العنصر"
        onMouseEnter={(e) => {
          e.currentTarget.classList.remove('opacity-0');
          e.currentTarget.classList.add('opacity-100');
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

