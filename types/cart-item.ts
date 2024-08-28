export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  priceInr: number | null;
  priceUsd: number | null;
}
