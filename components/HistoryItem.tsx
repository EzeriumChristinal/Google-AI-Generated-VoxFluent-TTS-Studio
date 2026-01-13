import React, { useRef, useState, useEffect } from 'react';
import { GeneratedClip } from '../types';
import { Button } from './Button';
import { Play, Download, Trash2, Pause } from 'lucide-react';

interface HistoryItemProps {
  clip: GeneratedClip;
  onDelete: (id: string) => void;
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ 
  clip, 
  onDelete, 
  currentlyPlayingId, 
  setCurrentlyPlayingId 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentlyPlayingId !== clip.id && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [currentlyPlayingId, clip.id, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentlyPlayingId(null);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentlyPlayingId(clip.id);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentlyPlayingId(null);
  };

  return (
    <div className="group bg-zinc-900 border border-zinc-800 p-4 transition-all hover:border-zinc-700 rounded-sm">
      <audio ref={audioRef} src={clip.blobUrl} onEnded={handleEnded} className="hidden" />
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider bg-cyan-950/30 px-2 py-1 rounded-sm">
            {clip.voiceName}
          </span>
          <span className="text-xs text-zinc-500 ml-3">
            {new Date(clip.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <button 
          onClick={() => onDelete(clip.id)}
          className="text-zinc-600 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <p className="text-zinc-300 text-sm italic mb-4 line-clamp-2 font-light border-l-2 border-zinc-700 pl-3">
        "{clip.text}"
      </p>
      
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={togglePlay}
          className="flex-1 py-2 text-xs"
          icon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>
        
        <a 
          href={clip.blobUrl} 
          download={`voxfluent-${clip.voiceName}-${clip.id.slice(0, 6)}.wav`}
          className="flex-1"
        >
          <Button 
            variant="primary" 
            className="w-full py-2 text-xs"
            icon={<Download size={14} />}
          >
            Save
          </Button>
        </a>
      </div>
    </div>
  );
};
