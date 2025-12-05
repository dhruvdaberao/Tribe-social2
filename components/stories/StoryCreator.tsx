



// import React, { useState, useRef, useEffect } from 'react';
// import type { Story } from '../../types';
// import { useTheme } from '../../contexts/ThemeContext';

// interface StoryCreatorProps {
//   onClose: () => void;
//   onCreate: (storyData: Omit<Story, 'id' | 'user' | 'createdAt' | 'author' | 'likes'>) => void;
// }

// type DraggableItem = {
//     type: 'text' | 'image';
//     offset: { x: number, y: number };
// } | null;

// const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onCreate }) => {
//   const { theme } = useTheme();
  
//   // State for image
//   const [image, setImage] = useState<{ src: string, pos: { x: number, y: number }, scale: number, rotation: number } | null>(null);
//   // State for text
//   const [text, setText] = useState<{ content: string, pos: { x: number, y: number }, scale: number, rotation: number } | null>(null);
  
//   const [isEditingText, setIsEditingText] = useState(false);
//   const [isPosting, setIsPosting] = useState(false);
//   const [activeDrag, setActiveDrag] = useState<DraggableItem>(null);
  
//   // Ref for the active element being manipulated (for sliders)
//   const [selectedElement, setSelectedElement] = useState<'text' | 'image' | null>(null);

//   const canvasRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Background color based on theme
//   const bgClass = theme === 'dark' ? 'bg-[#3B302B]' : 'bg-[#EAE4E0]';
//   const textColorClass = theme === 'dark' ? 'text-[#FAF8F6]' : 'text-[#3B302B]';

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImage({ src: reader.result as string, pos: { x: 50, y: 100 }, scale: 1, rotation: 0 });
//         setSelectedElement('image');
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleAddText = () => {
//     if (!text) {
//       setText({ content: 'Tap to edit', pos: { x: 50, y: 50 }, scale: 1, rotation: 0 });
//       setSelectedElement('text');
//     }
//     setIsEditingText(true);
//   };
  
//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'text' | 'image') => {
//       e.stopPropagation();
//       const target = e.currentTarget as HTMLDivElement;
//       // Get the bounding rect of the element being dragged relative to the viewport
//       const rect = target.getBoundingClientRect();
      
//       setSelectedElement(type);
//       setActiveDrag({
//           type,
//           // Calculate offset from the mouse pointer to the top-left of the element
//           offset: { x: e.clientX - rect.left, y: e.clientY - rect.top }
//       });
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!activeDrag) return;
    
//     // Canvas bounds
//     const canvasRect = canvasRef.current!.getBoundingClientRect();
    
//     // Calculate new position relative to canvas
//     // We adjust by the offset calculated on mouse down
//     let newX = e.clientX - canvasRect.left - activeDrag.offset.x;
//     let newY = e.clientY - canvasRect.top - activeDrag.offset.y;

//     if(activeDrag.type === 'text' && text) {
//         setText({ ...text, pos: { x: newX, y: newY } });
//     } else if (activeDrag.type === 'image' && image) {
//         setImage({ ...image, pos: {x: newX, y: newY }});
//     }
//   };

//   const handleMouseUp = () => {
//     setActiveDrag(null);
//   };

//   const handlePost = () => {
//     if (!image && (!text || !text.content.trim())) {
//         alert("Add some content to your story first!");
//         return;
//     }
//     setIsPosting(true);
//     // Note: We are simplifying the data sent to the backend.
//     // Ideally, the backend would support scale/rotation, but for now we just send position.
//     onCreate({
//         imageUrl: image?.src,
//         text: text?.content,
//         textPosition: text?.pos,
//         imagePosition: image?.pos,
//     });
//   };

//   const updateTransform = (prop: 'scale' | 'rotation', value: number) => {
//       if (selectedElement === 'text' && text) {
//           setText({ ...text, [prop]: value });
//       } else if (selectedElement === 'image' && image) {
//           setImage({ ...image, [prop]: value });
//       }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
//       <div className={`relative w-full max-w-md aspect-[9/16] ${bgClass} rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-white/20`}>
          
//           {/* Top Controls */}
//           <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/40 to-transparent">
//             <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
//                 <BackIcon />
//             </button>
//             <div className="flex space-x-3">
//                 <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
//                     <CameraIcon />
//                 </button>
//                 <button onClick={handleAddText} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
//                     <PenIcon />
//                 </button>
//             </div>
//           </div>

//           {/* Canvas Area */}
//           <div 
//             ref={canvasRef}
//             className="flex-1 relative overflow-hidden w-full h-full"
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             onMouseLeave={handleMouseUp}
//             onClick={() => setSelectedElement(null)} // Deselect on clicking empty space
//           >
//             {image && (
//                 <div 
//                     className={`absolute cursor-grab active:cursor-grabbing ${selectedElement === 'image' ? 'ring-2 ring-accent ring-offset-2 ring-offset-transparent' : ''}`}
//                     style={{ 
//                         left: `${image.pos.x}px`, 
//                         top: `${image.pos.y}px`,
//                         transform: `scale(${image.scale}) rotate(${image.rotation}deg)`,
//                         transition: activeDrag ? 'none' : 'transform 0.1s ease-out'
//                     }}
//                     onMouseDown={(e) => handleMouseDown(e, 'image')}
//                 >
//                     <img src={image.src} alt="Story content" className="w-64 rounded-xl shadow-lg pointer-events-none" />
//                 </div>
//             )}
            
//             {text && (
//                 <div 
//                     className={`absolute font-bold p-2 cursor-grab active:cursor-grabbing ${selectedElement === 'text' ? 'ring-2 ring-accent ring-dashed rounded-lg' : ''}`}
//                     style={{
//                         left: `${text.pos.x}px`, 
//                         top: `${text.pos.y}px`,
//                         transform: `scale(${text.scale}) rotate(${text.rotation}deg)`,
//                         color: theme === 'dark' ? '#FAF8F6' : '#3B302B',
//                         fontSize: '1.5rem',
//                         maxWidth: '80%',
//                         textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
//                     }}
//                     onMouseDown={(e) => {
//                         if(!isEditingText) handleMouseDown(e, 'text')
//                     }}
//                     onDoubleClick={() => setIsEditingText(true)}
//                 >
//                     {isEditingText ? (
//                         <textarea
//                             value={text.content}
//                             onChange={(e) => setText(prev => prev ? {...prev, content: e.target.value } : null)}
//                             onBlur={() => setIsEditingText(false)}
//                             autoFocus
//                             className="bg-transparent border-none outline-none resize-none text-center overflow-hidden w-full"
//                             style={{ minHeight: '1.5em' }}
//                         />
//                     ) : (
//                         <span className="font-display">{text.content}</span>
//                     )}
//                 </div>
//             )}
//           </div>

//           {/* Transformation Controls (Visible when an element is selected) */}
//           {selectedElement && (
//               <div className="absolute bottom-20 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-4 z-30 transition-all">
//                   <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider text-center">
//                       Adjust {selectedElement}
//                   </p>
//                   <div className="space-y-3">
//                       <div className="flex items-center space-x-2">
//                           <span className="text-white text-xs w-8">Size</span>
//                           <input 
//                               type="range" 
//                               min="0.5" 
//                               max="3" 
//                               step="0.1" 
//                               value={selectedElement === 'text' ? text?.scale : image?.scale}
//                               onChange={(e) => updateTransform('scale', parseFloat(e.target.value))}
//                               className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
//                           />
//                       </div>
//                       <div className="flex items-center space-x-2">
//                           <span className="text-white text-xs w-8">Rotate</span>
//                           <input 
//                               type="range" 
//                               min="-180" 
//                               max="180" 
//                               value={selectedElement === 'text' ? text?.rotation : image?.rotation}
//                               onChange={(e) => updateTransform('rotation', parseInt(e.target.value))}
//                               className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
//                           />
//                       </div>
//                   </div>
//               </div>
//           )}

//           {/* Bottom Action */}
//           <div className="p-4 z-30 bg-gradient-to-t from-black/40 to-transparent">
//              <button 
//                 onClick={handlePost} 
//                 disabled={isPosting}
//                 className="w-full bg-accent text-accent-text font-bold py-4 rounded-2xl hover:bg-accent-hover transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
//             >
//                 {isPosting ? (
//                     <span>Posting...</span>
//                 ) : (
//                     <>
//                         <span>Share to Story</span>
//                         <SendIcon />
//                     </>
//                 )}
//              </button>
//           </div>
          
//           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
//       </div>
//     </div>
//   );
// };

// const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
// const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
// const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" /></svg>;
// const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;

// export default StoryCreator;










import React, { useState, useRef, useEffect } from 'react';
import type { Story } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface StoryCreatorProps {
  onClose: () => void;
  onCreate: (storyData: Omit<Story, 'id' | 'user' | 'createdAt' | 'author' | 'likes'>) => void;
}

const COLORS = [
    '#2A2320', // Dark Brown
    '#EAE4E0', // Cream
    '#F87171', // Red
    '#FBBF24', // Amber
    '#34D399', // Emerald
    '#60A5FA', // Blue
    '#A78BFA', // Violet
    '#F472B6', // Pink
];

const TEXT_COLORS = [
    '#FFFFFF', // White
    '#000000', // Black
    '#3B302B', // Dark Brown
    '#F5F1EE', // Warm White
];

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onCreate }) => {
  const { theme } = useTheme();
  
  // State for image
  const [image, setImage] = useState<{ src: string, pos: { x: number, y: number }, scale: number, rotation: number } | null>(null);
  // State for text
  const [text, setText] = useState<{ content: string, pos: { x: number, y: number }, scale: number, rotation: number, color: string } | null>(null);
  const [storyBg, setStoryBg] = useState(theme === 'dark' ? '#2A2320' : '#EAE4E0');
  
  const [isEditingText, setIsEditingText] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<'text' | 'image' | null>(null);

  // Dragging state
  const dragInfo = useRef<{ 
      startX: number, startY: number, 
      initialX: number, initialY: number,
      initialRotation: number, initialScale: number,
      action: 'move' | 'rotate' | 'resize' | null
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, initialRotation: 0, initialScale: 1, action: null });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ src: reader.result as string, pos: { x: 50, y: 100 }, scale: 1, rotation: 0 });
        setSelectedElement('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    if (!text) {
      setText({ content: 'Tap to edit', pos: { x: 50, y: 150 }, scale: 1, rotation: 0, color: '#FFFFFF' });
      setSelectedElement('text');
    }
    setIsEditingText(true);
  };

  // --- Interaction Logic ---

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'image', action: 'move' | 'rotate' | 'resize') => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedElement(type);
      
      const targetState = type === 'text' ? text : image;
      if (!targetState) return;

      dragInfo.current = {
          startX: e.clientX,
          startY: e.clientY,
          initialX: targetState.pos.x,
          initialY: targetState.pos.y,
          initialRotation: targetState.rotation,
          initialScale: targetState.scale,
          action
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo.current.action || !selectedElement) return;

      const { startX, startY, initialX, initialY, initialRotation, initialScale, action } = dragInfo.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (action === 'move') {
          const newPos = { x: initialX + dx, y: initialY + dy };
          if (selectedElement === 'text') setText(prev => prev ? { ...prev, pos: newPos } : null);
          else setImage(prev => prev ? { ...prev, pos: newPos } : null);
      } else if (action === 'resize') {
          // Simple resize logic: distance from start point
          // Ideally, this should calculate distance from center, but this is a simple approximation
          // that works intuitively for dragging a corner handle.
          const scaleChange = (dx + dy) * 0.005; 
          const newScale = Math.max(0.2, initialScale + scaleChange);
          
          if (selectedElement === 'text') setText(prev => prev ? { ...prev, scale: newScale } : null);
          else setImage(prev => prev ? { ...prev, scale: newScale } : null);
      } else if (action === 'rotate') {
          // Calculate angle
          // We assume the center of the element is roughly where we started or static relative to mouse
          // A simpler rotation for UI is just X-axis movement = rotation
          const rotationChange = dx * 0.5;
          const newRotation = initialRotation + rotationChange;

          if (selectedElement === 'text') setText(prev => prev ? { ...prev, rotation: newRotation } : null);
          else setImage(prev => prev ? { ...prev, rotation: newRotation } : null);
      }
  };

  const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      dragInfo.current.action = null;
  };

  // ---

  const handlePost = () => {
    if (!image && (!text || !text.content.trim())) {
        alert("Add some content to your story first!");
        return;
    }
    setIsPosting(true);
    
    onCreate({
        imageUrl: image?.src,
        text: text?.content,
        // Save exact transforms
        textPosition: text?.pos,
        imagePosition: image?.pos,
        textRotation: text?.rotation,
        imageRotation: image?.rotation,
        textScale: text?.scale,
        imageScale: image?.scale,
        textColor: text?.color,
        backgroundColor: storyBg
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      {/* Canvas Container */}
      <div 
        className="relative w-full max-w-md aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-white/20 transition-colors duration-300"
        style={{ backgroundColor: storyBg }}
      >
          
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
            <button onClick={onClose} className="pointer-events-auto p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                <BackIcon />
            </button>
            <div className="flex space-x-3 pointer-events-auto">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                    <CameraIcon />
                </button>
                <button onClick={handleAddText} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                    <PenIcon />
                </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div 
            ref={canvasRef}
            className="flex-1 relative overflow-hidden w-full h-full"
            onMouseDown={() => setSelectedElement(null)} // Deselect bg click
          >
            {image && (
                <div 
                    className={`absolute select-none`}
                    style={{ 
                        left: `${image.pos.x}px`, 
                        top: `${image.pos.y}px`,
                        transform: `rotate(${image.rotation}deg) scale(${image.scale})`,
                        transformOrigin: 'center center',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'image', 'move')}
                >
                    <div className={`relative ${selectedElement === 'image' ? 'ring-2 ring-blue-500 ring-dashed' : ''}`}>
                        <img 
                            src={image.src} 
                            alt="Story content" 
                            className="w-64 rounded-xl shadow-lg pointer-events-none" 
                            draggable={false}
                        />
                        {selectedElement === 'image' && (
                            <>
                                {/* Resize Handle - Bottom Right */}
                                <div 
                                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-white text-blue-600 rounded-full shadow-md flex items-center justify-center cursor-nwse-resize z-50"
                                    onMouseDown={(e) => handleMouseDown(e, 'image', 'resize')}
                                >
                                    <ResizeIcon />
                                </div>
                                {/* Rotate Handle - Top Right */}
                                <div 
                                    className="absolute -top-4 -right-4 w-8 h-8 bg-white text-blue-600 rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-50"
                                    onMouseDown={(e) => handleMouseDown(e, 'image', 'rotate')}
                                >
                                    <RotateIcon />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {text && (
                <div 
                    className={`absolute select-none`}
                    style={{
                        left: `${text.pos.x}px`, 
                        top: `${text.pos.y}px`,
                        transform: `rotate(${text.rotation}deg) scale(${text.scale})`,
                        transformOrigin: 'center center',
                    }}
                    onMouseDown={(e) => {
                        if(!isEditingText) handleMouseDown(e, 'text', 'move')
                    }}
                >
                    <div className={`relative p-2 ${selectedElement === 'text' && !isEditingText ? 'ring-2 ring-blue-500 ring-dashed rounded-lg' : ''}`}>
                        {isEditingText ? (
                            <textarea
                                value={text.content}
                                onChange={(e) => setText(prev => prev ? {...prev, content: e.target.value } : null)}
                                onBlur={() => setIsEditingText(false)}
                                autoFocus
                                className="bg-transparent border-none outline-none resize-none text-center overflow-hidden w-64 text-2xl font-bold font-display"
                                style={{ color: text.color, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                            />
                        ) : (
                            <span 
                                className="font-display font-bold text-2xl whitespace-pre-wrap text-center block w-max max-w-[250px]"
                                style={{ color: text.color, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                                onDoubleClick={() => setIsEditingText(true)}
                            >
                                {text.content}
                            </span>
                        )}

                        {selectedElement === 'text' && !isEditingText && (
                            <>
                                 {/* Resize Handle */}
                                 <div 
                                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-white text-blue-600 rounded-full shadow-md flex items-center justify-center cursor-nwse-resize z-50"
                                    onMouseDown={(e) => handleMouseDown(e, 'text', 'resize')}
                                >
                                    <ResizeIcon />
                                </div>
                                {/* Rotate Handle */}
                                <div 
                                    className="absolute -top-4 -right-4 w-8 h-8 bg-white text-blue-600 rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-50"
                                    onMouseDown={(e) => handleMouseDown(e, 'text', 'rotate')}
                                >
                                    <RotateIcon />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Bottom Action Area */}
          <div className="p-4 z-30 bg-gradient-to-t from-black/60 to-transparent flex flex-col gap-4">
             {/* Color Picker (Contextual) */}
             <div className="flex justify-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
                 {selectedElement === 'text' ? (
                     TEXT_COLORS.map(c => (
                         <button 
                            key={c}
                            onClick={() => setText(prev => prev ? {...prev, color: c} : null)}
                            className={`w-8 h-8 rounded-full border-2 ${text?.color === c ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                            style={{ backgroundColor: c }}
                         />
                     ))
                 ) : (
                     COLORS.map(c => (
                        <button 
                           key={c}
                           onClick={() => setStoryBg(c)}
                           className={`w-8 h-8 rounded-full border-2 ${storyBg === c ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                           style={{ backgroundColor: c }}
                        />
                    ))
                 )}
             </div>

             <button 
                onClick={handlePost} 
                disabled={isPosting}
                className="w-full bg-accent text-accent-text font-bold py-3.5 rounded-2xl hover:bg-accent-hover transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                {isPosting ? (
                    <span>Posting...</span>
                ) : (
                    <>
                        <span>Share to Story</span>
                        <SendIcon />
                    </>
                )}
             </button>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};

// Icons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const RotateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const ResizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;

export default StoryCreator;