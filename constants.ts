import { VoiceOption } from './types';

export const AVAILABLE_VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Calm, soothing, and clear.' },
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Energetic, friendly, and somewhat informal.' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep, authoritative, and serious.' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Resonant, powerful, and intense.' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Gentle, airy, and soft.' },
];

export const DEFAULT_PROMPT = "The quick brown fox jumps over the lazy dog. Voice synthesis is truly fascinating.";
