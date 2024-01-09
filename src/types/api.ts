export interface Movie {
  id: string;
  title: string;
  rating: string;
  posterUrl: string;
  reviewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
