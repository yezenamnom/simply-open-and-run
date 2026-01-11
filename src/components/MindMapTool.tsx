import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { 
  Target, 
  Download, 
  Upload, 
  FileText,
  Brain,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Trash2,
  Plus,
  Minus,
  Maximize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  children: MindMapNode[];
  color: string;
  level: number;
}

interface MindMapProps {
  onGenerateMindMap: (content: string) => void;
  onAnalyzeFiles: (files: File[]) => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  analysisProgress?: number;
}

export const MindMapTool = ({ 
  onGenerateMindMap, 
  onAnalyzeFiles, 
  disabled = false,
  isAnalyzing = false,
  analysisProgress = 0
}: MindMapProps) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899'
  ];

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onAnalyzeFiles(files);
    }
  }, [onAnalyzeFiles]);

  const generateMindMap = useCallback(() => {
    const sampleNodes: MindMapNode[] = [
      {
        id: '1',
        text: 'الموضوع الرئيسي',
        x: 400,
        y: 300,
        children: [
          {
            id: '1-1',
            text: 'المفهوم الأساسي',
            x: 250,
            y: 200,
            children: [],
            color: colors[0],
            level: 1
          },
          {
            id: '1-2',
            text: 'القواعد والقوانين',
            x: 550,
            y: 200,
            children: [],
            color: colors[1],
            level: 1
          }
        ],
        color: colors[2],
        level: 0
      },
      {
        id: '2',
        text: 'التطبيقات',
        x: 400,
        y: 400,
        children: [
          {
            id: '2-1',
            text: 'أمثلة عملية',
            x: 300,
            y: 350,
            children: [],
            color: colors[3],
            level: 1
          },
          {
            id: '2-2',
            text: 'حالات خاصة',
            x: 500,
            y: 350,
            children: [],
            color: colors[4],
            level: 1
          }
        ],
        color: colors[5],
        level: 0
      }
    ];
    setNodes(sampleNodes);
  }, []);

  const handleNodeDragStart = (nodeId: string) => {
    setIsDragging(true);
    setDraggedNode(nodeId);
  };

  const handleNodeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && draggedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        
        setNodes(prev => prev.map(node => 
          node.id === draggedNode 
            ? { ...node, x, y }
            : node
        ));
      }
    }
  };

  const handleNodeDragEnd = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderNode = (node: MindMapNode, isChild: boolean = false) => {
    const isSelected = selectedNode === node.id;
    const nodeSize = isChild ? 'w-32 h-16 text-xs' : 'w-40 h-20 text-sm';
    const fontSize = isChild ? 'text-xs' : 'text-sm';

    return (
      <div
        key={node.id}
        className={cn(
          'absolute cursor-move rounded-lg border-2 shadow-lg transition-all duration-200 flex items-center justify-center p-2',
          nodeSize,
          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800 hover:shadow-xl'
        )}
        style={{
          left: `${node.x * zoom + pan.x}px`,
          top: `${node.y * zoom + pan.y}px`,
          backgroundColor: node.color + '20',
          borderColor: node.color,
          transform: `scale(${zoom})`,
          transformOrigin: 'center'
        }}
        onMouseDown={() => handleNodeDragStart(node.id)}
        onMouseMove={handleNodeDrag}
        onMouseUp={handleNodeDragEnd}
        onClick={() => setSelectedNode(node.id)}
      >
        <div className={cn('font-medium text-center', fontSize)} style={{ color: node.color }}>
          {node.text}
        </div>
        {node.children.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    );
  };

  const renderConnections = () => {
    return nodes.map(node => 
      node.children.map(child => {
        const parentX = node.x * zoom + pan.x + (40 * zoom) / 2;
        const parentY = node.y * zoom + pan.y + (20 * zoom) / 2;
        const childX = child.x * zoom + pan.x + (32 * zoom) / 2;
        const childY = child.y * zoom + pan.y + (16 * zoom) / 2;

        return (
          <svg
            key={`${node.id}-${child.id}`}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={child.color}
                />
              </marker>
            </defs>
            <line
              x1={parentX}
              y1={parentY}
              x2={childX}
              y2={childY}
              stroke={child.color}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        );
      })
    ).flat();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">خريطة ذهنية تفاعلية</h3>
          </div>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Brain className="h-4 w-4 animate-pulse" />
              <span>جاري التحليل...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.doc,.txt,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isAnalyzing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>رفع ملفات</span>
          </Button>

          {/* Generate Button */}
          <Button
            variant="default"
            size="sm"
            onClick={generateMindMap}
            disabled={disabled || isAnalyzing}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Target className="h-4 w-4" />
            <span>إنشاء خريطة</span>
          </Button>

          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalysis(!showAnalysis)}
            disabled={disabled}
            className="gap-2"
          >
            {showAnalysis ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showAnalysis ? 'خريطة' : 'تحليل'}</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <div className="mb-4">
          <Progress value={analysisProgress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground mt-2">
            جاري تحليل الملفات... {analysisProgress}%
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6 h-full">
        {/* Mind Map Canvas */}
        {!showAnalysis && (
          <div 
            ref={canvasRef}
            className="flex-1 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 relative overflow-hidden"
            style={{ minHeight: '500px' }}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetView}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Nodes and Connections */}
            {renderConnections()}
            {nodes.map(node => renderNode(node))}
            {nodes.map(node => 
              node.children.map(child => renderNode(child, true))
            ).flat()}
          </div>
        )}

        {/* Analysis Panel */}
        {showAnalysis && (
          <div className="w-96 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">تحليل المحتوى</h3>
            </div>
            
            {analysisResults ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">الموضوعات الرئيسية</h4>
                  <ul className="space-y-1 text-sm">
                    {analysisResults.topics?.map((topic: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">المفاهيم الأساسية</h4>
                  <ul className="space-y-1 text-sm">
                    {analysisResults.concepts?.map((concept: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">العلاقات</h4>
                  <ul className="space-y-1 text-sm">
                    {analysisResults.relationships?.map((rel: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1"></div>
                        <span>{rel}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>ارفع ملفات لبدء التحليل</p>
                <p className="text-sm">يدعم PDF، Word، الصور، والنصوص</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>جاهز للعمل</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = { nodes, zoom, pan };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'mindmap.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span>حفظ</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = { nodes };
              onGenerateMindMap(JSON.stringify(data, null, 2));
            }}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            <span>تحليل ذكي</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
