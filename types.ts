export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export interface GeneratedClip {
  id: string;
  text: string;
  voiceName: string;
  timestamp: number;
  audioBuffer: AudioBuffer | null;
  blobUrl: string; // WAV blob URL for downloading
  duration: number;
}

export enum TTSStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}
