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

export const MODE_LABELS: Record<'FUN' | 'FUN_CORPORATE' | 'CHILL', string> = {
  FUN: 'Fun',
  FUN_CORPORATE: 'Fun + Corporate',
  CHILL: 'Chill / Soft',
};

export const MODE_DESCRIPTIONS: Record<'FUN' | 'FUN_CORPORATE' | 'CHILL', string> = {
  FUN: 'Ambiance potes, délires et missions sociales.',
  FUN_CORPORATE: 'Team‑building léger, zéro gênance.',
  CHILL: 'Très doux, idéal si certains sont timides.',
};

const BASE_MISSIONS: Mission[] = [
  { id: 'b1', description: 'Faire dire à votre cible un mot en anglais au hasard.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 'b2', description: 'Obtenir un high‑five collectif avec au moins 3 personnes.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 'b3', description: 'Faire rire votre cible sans lui poser de question.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: 'b4', description: 'Faire poser votre cible pour une photo “agent secret”.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 'b5', description: 'Faire écrire un mot au hasard sur votre téléphone.', difficulty: 1, category: MissionCategory.LOGIC },
  { id: 'b6', description: 'Faire choisir à votre cible un objet “porte‑bonheur”.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 'b7', description: 'Faire deviner votre pseudo à votre cible en 3 indices.', difficulty: 2, category: MissionCategory.LOGIC },
  { id: 'b8', description: 'Faire dire “mission accomplie” à votre cible.', difficulty: 1, category: MissionCategory.HUMOR },
  { id: 'b9', description: 'Faire prendre une photo de groupe avec votre cible.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: 'b10', description: 'Faire complimenter un autre joueur par votre cible.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: 'b11', description: 'Faire inventer un slogan pour la soirée.', difficulty: 2, category: MissionCategory.CREATIVE },
  { id: 'b12', description: 'Faire mimer une émotion à votre cible pendant 5 secondes.', difficulty: 2, category: MissionCategory.PERFORMANCE },
];

const FUN_MISSIONS: Mission[] = [
  { id: 'f1', description: 'Faire chanter un mini‑refrain inventé à votre cible.', difficulty: 2, category: MissionCategory.PERFORMANCE },
  { id: 'f2', description: 'Faire prendre une pose “super‑héros” à votre cible.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 'f3', description: 'Faire imiter un animal discret pendant 5 secondes.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: 'f4', description: 'Faire raconter la pire blague possible à votre cible.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: 'f5', description: 'Faire tourner sur soi‑même une fois votre cible.', difficulty: 1, category: MissionCategory.PHYSICAL },
  { id: 'f6', description: 'Faire dire “Je suis l’agent double” à votre cible.', difficulty: 1, category: MissionCategory.HUMOR },
  { id: 'f7', description: 'Faire deviner un film en un seul mot.', difficulty: 2, category: MissionCategory.LOGIC },
  { id: 'f8', description: 'Faire prendre une photo avec un objet rouge.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 'f9', description: 'Faire inventer un nom de groupe pour vous deux.', difficulty: 2, category: MissionCategory.CREATIVE },
  { id: 'f10', description: 'Faire jouer à pierre‑feuille‑ciseaux pour un gage minuscule.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: 'f11', description: 'Faire changer de place à votre cible dans la pièce.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 'f12', description: 'Faire dire un compliment déguisé à un autre joueur.', difficulty: 2, category: MissionCategory.SOCIAL },
];

const FUN_CORPORATE_MISSIONS: Mission[] = [
  { id: 'c1', description: 'Faire proposer un “titre de poste” amusant à votre cible.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 'c2', description: 'Faire donner un feedback positif à un joueur.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 'c3', description: 'Faire décrire sa “valeur” en un mot.', difficulty: 1, category: MissionCategory.LOGIC },
  { id: 'c4', description: 'Faire inventer un slogan d’équipe en 5 mots.', difficulty: 2, category: MissionCategory.CREATIVE },
  { id: 'c5', description: 'Faire mimer une réunion sans paroles pendant 5 secondes.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: 'c6', description: 'Faire définir un “objectif de soirée” en une phrase.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 'c7', description: 'Faire voter votre cible pour un “agent du mois”.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: 'c8', description: 'Faire donner un conseil de productivité absurde.', difficulty: 2, category: MissionCategory.HUMOR },
  { id: 'c9', description: 'Faire créer un nom de projet pour la soirée.', difficulty: 2, category: MissionCategory.CREATIVE },
  { id: 'c10', description: 'Faire dire “aligné et impactant” à votre cible.', difficulty: 1, category: MissionCategory.HUMOR },
  { id: 'c11', description: 'Faire inventer un KPI drôle pour la soirée.', difficulty: 2, category: MissionCategory.LOGIC },
  { id: 'c12', description: 'Faire demander à un joueur “tu peux te sync ?”.', difficulty: 2, category: MissionCategory.HUMOR },
];

const CHILL_MISSIONS: Mission[] = [
  { id: 's1', description: 'Faire choisir une chanson “ambiance chill”.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 's2', description: 'Faire décrire un souvenir sympa en une phrase.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 's3', description: 'Faire proposer un snack idéal pour la soirée.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 's4', description: 'Faire répondre à un mini‑quiz: “thé ou café ?”.', difficulty: 1, category: MissionCategory.LOGIC },
  { id: 's5', description: 'Faire écrire un emoji qui décrit son humeur.', difficulty: 1, category: MissionCategory.HUMOR },
  { id: 's6', description: 'Faire choisir une couleur qui représente la soirée.', difficulty: 1, category: MissionCategory.CREATIVE },
  { id: 's7', description: 'Faire raconter une anecdote en 10 secondes.', difficulty: 2, category: MissionCategory.SOCIAL },
  { id: 's8', description: 'Faire proposer une activité “tranquille” à faire.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 's9', description: 'Faire deviner un mot avec un seul geste.', difficulty: 2, category: MissionCategory.PERFORMANCE },
  { id: 's10', description: 'Faire envoyer un “merci” à un autre joueur.', difficulty: 1, category: MissionCategory.SOCIAL },
  { id: 's11', description: 'Faire dire “on garde le flow”.', difficulty: 1, category: MissionCategory.HUMOR },
  { id: 's12', description: 'Faire choisir un coin “calme” dans la maison.', difficulty: 1, category: MissionCategory.SOCIAL },
];

export const MODE_MISSIONS: Record<'FUN' | 'FUN_CORPORATE' | 'CHILL', Mission[]> = {
  FUN: [...BASE_MISSIONS, ...FUN_MISSIONS, ...DEFAULT_MISSIONS],
  FUN_CORPORATE: [...BASE_MISSIONS, ...FUN_CORPORATE_MISSIONS, ...DEFAULT_MISSIONS],
  CHILL: [...BASE_MISSIONS, ...CHILL_MISSIONS],
};

export const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
];
