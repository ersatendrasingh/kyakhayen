export interface CartItem {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;

  quantity: number;
  type?: string | null;
}
