export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAccountCode(code: string): string {
  // Format account code with proper spacing (e.g., 1-01-001)
  return code.replace(/^(\d+)(\d{2})(\d{3})$/, "$1-$2-$3");
}
