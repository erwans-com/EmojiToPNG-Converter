import React from 'react';

export interface EmojiRecord {
  id: number;
  slug: string;
  emoji: string;
  name: string;
  category?: string;
  group?: string;
  unicode?: string;
  info?: string; // Maps to description
  trivia?: string | string[];
  common_uses?: string | string[];
  related_emojis?: string | string[];
  updated_at?: string;
}

export interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  isActive?: boolean;
}