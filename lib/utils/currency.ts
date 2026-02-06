export const CURRENCY_OPTIONS = [
  { code: "UAH", label: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
];

export function getCurrencySymbol(code: string) {
  const opt = CURRENCY_OPTIONS.find((o) => o.code === code);
  return opt ? opt.symbol : "₴";
}

export function formatCurrency(amount: number, currencyCode = "UAH") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback to naive formatting
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  }
}
