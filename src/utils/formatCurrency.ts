export function formatCurrency(numero: number | string): string {
  const data = Number(numero);
  return data.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
