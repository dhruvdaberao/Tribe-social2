import React from 'react';
import type { Story } from '../../types';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onDelete: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent text-white flex-shrink-0 z-20">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><BackIcon /></button>
        <button onClick={() => onDelete(story.id)} className="p-2 rounded-full hover:bg-white/10"><TrashIcon /></button>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-900 to-black relative overflow-hidden">
        {story.imageUrl && (
            <div 
                className="absolute"
                style={{ left: `${story.imagePosition?.x || 0}px`, top: `${story.imagePosition?.y || 0}px` }}
            >
                <img src={story.imageUrl} alt="Story content" className="w-48 rounded-lg shadow-lg" />
            </div>
        )}
        {story.text && (
            <div 
                className="absolute text-white text-2xl font-bold p-2"
                style={{
                    left: `${story.textPosition?.x || 50}px`, 
                    top: `${story.textPosition?.y || 50}px`,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                }}
            >
                <span>{story.text}</span>
            </div>
        )}
      </div>
    </div>
  );
};

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const TrashIcon = ({ className = 'h-6 w-6' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default StoryViewer;
