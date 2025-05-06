// src/types/index.ts
export interface SummarizedLink {
  id: string;
  url: string;
  summary: string;
  createdAt: number;
  updatedAt?: number; // Optional: timestamp of the last summary update
}
