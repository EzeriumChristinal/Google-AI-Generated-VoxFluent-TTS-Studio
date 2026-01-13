import React from 'react';
import { VoiceOption } from '../types';
import { AVAILABLE_VOICES } from '../constants';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelect: (voiceId: string) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoiceId, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {AVAILABLE_VOICES.map((voice) => {
        const isSelected = voice.id === selectedVoiceId;
        return (
          <button
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            disabled={disabled}
            className={`
              relative p-4 text-left transition-all duration-200 border-2 rounded-sm
              ${isSelected 
                ? 'border-cyan-500 bg-zinc-800' 
                : 'border-transparent bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-lg ${isSelected ? 'text-cyan-400' : 'text-zinc-100'}`}>
                {voice.name}
              </span>
              {isSelected && (
                <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              )}
            </div>
            <div className="text-xs text-zinc-400 uppercase tracking-widest mb-2">{voice.gender}</div>
            <p className="text-sm text-zinc-500 line-clamp-2">{voice.description}</p>
          </button>
        );
      })}
    </div>
  );
};
