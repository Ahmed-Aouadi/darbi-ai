/**
 * مصدر بيانات التحديات — للخادم فقط (مكوّنات app/** الخادمية).
 * ممنوع استيراد هذا الملف أو content/*.json من مكوّن عميل 'use client'
 * (يمنعه ESLint)، لأن ذلك يرسل الاختبارات المخفية إلى المتصفح.
 */
import raw from '../content/challenges.json';
import tracksRaw from '../content/tracks.json';
import { toCard, toProgressChallenge, toPublicChallenge } from './challenges-public.mjs';
import type { ChallengeCardData, ProgressChallenge, PublicChallenge } from './types';

const all = raw as unknown as Array<Record<string, any>>;

export const getChallenges = (): PublicChallenge[] => all.map(toPublicChallenge) as PublicChallenge[];
export const getChallengeCards = (): ChallengeCardData[] => all.map(toCard) as ChallengeCardData[];
export const getProgressChallenges = (): ProgressChallenge[] => all.map(toProgressChallenge) as ProgressChallenge[];

export function getChallenge(slug: string): PublicChallenge | undefined {
  const found = all.find((c) => c.slug === slug);
  return found ? (toPublicChallenge(found) as PublicChallenge) : undefined;
}

export function getNeighbors(slug: string): { prev?: ChallengeCardData; next?: ChallengeCardData } {
  const index = all.findIndex((c) => c.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? (toCard(all[index - 1]) as ChallengeCardData) : undefined,
    next: index < all.length - 1 ? (toCard(all[index + 1]) as ChallengeCardData) : undefined,
  };
}

export const getTracks = (): Record<string, string[]> => tracksRaw as Record<string, string[]>;
