import React, { useState, useRef, useCallback } from 'react';
import './SplitPane.css';

const SplitPane = ({ children, defaultSplit = 70, minSize = 200, maxSize = 800 }) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const newSplit = ((e.clientX - containerRect.left) / containerWidth) * 100;

    // Constrain split within min/max sizes
    const minSplit = (minSize / containerWidth) * 100;
    const maxSplit = 100 - ((minSize / containerWidth) * 100);
    
    if (newSplit >= minSplit && newSplit <= maxSplit) {
      setSplit(newSplit);
    }
  }, [isDragging, minSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const [leftChild, rightChild] = React.Children.toArray(children);

  return (
    <div className="split-pane-container" ref={containerRef}>
      <div 
        className="pane" 
        style={{ 
          width: `${split}%`,
          minWidth: `${minSize}px`,
          maxWidth: `${maxSize}px`
        }}
      >
        {leftChild}
      </div>
      <div 
        className="resizer"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'col-resize' : 'col-resize' }}
      />
      <div 
        className="pane" 
        style={{ 
          width: `${100 - split}%`,
          minWidth: `${minSize}px`,
          maxWidth: `${maxSize}px`
        }}
      >
        {rightChild}
      </div>
    </div>
  );
};

export default SplitPane;
