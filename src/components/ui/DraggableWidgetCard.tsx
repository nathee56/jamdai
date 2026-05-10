import React, { ReactNode } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { IconGripVertical } from './Icons';

interface DraggableWidgetCardProps {
  id: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isDraggable?: boolean;
}

export default function DraggableWidgetCard({ id, children, className = '', style = {}, isDraggable = true }: DraggableWidgetCardProps) {
  const controls = useDragControls();

  if (!isDraggable) {
    return <div className={`relative ${className}`} style={style}>{children}</div>;
  }

  return (
    <Reorder.Item 
      value={id} 
      id={id}
      dragListener={false} 
      dragControls={controls}
      className={`relative ${className}`}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', zIndex: 50 }}
    >
      {/* Drag Handle */}
      <div 
        className="absolute top-4 right-4 z-10 p-1.5 rounded-md cursor-grab active:cursor-grabbing text-text-hint hover:text-text-secondary hover:bg-surface-raised transition-colors"
        onPointerDown={(e) => controls.start(e)}
        title="ลากเพื่อจัดเรียง"
      >
        <IconGripVertical size={16} />
      </div>
      
      {/* Content */}
      {children}
    </Reorder.Item>
  );
}
