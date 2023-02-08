export function formatDecimal(numero: number | string): string {
  const data = Number(numero);
  return data.toLocaleString('pt-BR', {
    style: 'decimal',
  });
}
