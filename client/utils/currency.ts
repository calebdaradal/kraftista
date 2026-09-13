/**
 * Format a number as Philippine Peso currency.
 * Standard placement: amount followed by ₱.
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)}₱`;
}
