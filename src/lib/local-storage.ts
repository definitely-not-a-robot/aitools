import type { SummarizedLink } from '@/types';

const LINKS_STORAGE_KEY = 'summarizedLinks';

export function getStoredLinks(): SummarizedLink[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedLinks = window.localStorage.getItem(LINKS_STORAGE_KEY);
    return storedLinks ? JSON.parse(storedLinks) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function storeLinks(links: SummarizedLink[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}
