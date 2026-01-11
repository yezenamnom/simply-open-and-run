import { useCallback } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    // سيتم التعامل مع الحذف في WorkflowBuilder
    const deleteEvent = new CustomEvent('deleteEdge', { detail: { edgeId: id } });
    window.dispatchEvent(deleteEvent);
  }, [id]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#3b82f6' : '#94a3b8',
          strokeDasharray: '5,5',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onEdgeClick}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 transition-all",
              selected 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                : "border-gray-300 dark:border-gray-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            )}
            title="حذف الخط"
          >
            <X className={cn(
              "h-3 w-3",
              selected ? "text-blue-600" : "text-gray-500 hover:text-red-600"
            )} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

