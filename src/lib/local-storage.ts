import type { SummarizedLink } from '@/types';

const LINKS_STORAGE_KEY = 'summarizedLinks';
const LIST_NAME_STORAGE_KEY = 'linkListName';
const DEFAULT_LIST_NAME = 'My Summarized Links';

export function getStoredLinks(): SummarizedLink[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedLinks = window.localStorage.getItem(LINKS_STORAGE_KEY);
    return storedLinks ? JSON.parse(storedLinks) : [];
  } catch (error) {
    console.error('Error reading links from localStorage:', error);
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
    console.error('Error writing links to localStorage:', error);
  }
}

export function getStoredListName(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_LIST_NAME;
  }
  try {
    const storedName = window.localStorage.getItem(LIST_NAME_STORAGE_KEY);
    return storedName || DEFAULT_LIST_NAME;
  } catch (error) {
    console.error('Error reading list name from localStorage:', error);
    return DEFAULT_LIST_NAME;
  }
}

export function storeListName(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LIST_NAME_STORAGE_KEY, name);
  } catch (error) {
    console.error('Error writing list name to localStorage:', error);
  }
}
