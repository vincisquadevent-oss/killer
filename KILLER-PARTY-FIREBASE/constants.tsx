import React from 'react';
import { MissionCategory, Mission } from './types.ts';

export const DEFAULT_MISSIONS: Mission[] = [
  { id: '1', description: 'Faire répéter un mot complexe (ex: anticonstitutionnellement) 3 fois à votre cible.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: '2', description: 'Obtenir un selfie avec votre cible où elle sourit.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: '3', description: 'Faire chanter le refrain d\'une chanson connue à votre cible.', difficulty: 2, category: MissionCategory.PERFORMANCE },
  { id: '4', description: 'Glisser discrètement un objet dans la poche ou le sac de votre cible.', difficulty: 3, category: MissionCategory.STEALTH },
  { id: '5', description: 'Faire imiter un animal à votre cible pendant une conversation.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: '6', description: 'Faire asseoir votre cible par terre sans raison apparente.', difficulty: 2, category: MissionCategory.PHYSICAL },
  { id: '7', description: 'Obtenir une poignée de main de plus de 10 secondes.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: '8', description: 'Faire dire à votre cible: "Je suis un petit poney royal".', difficulty: 3, category: MissionCategory.HUMOR },
];

export const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
];
