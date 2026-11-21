
/**
 * Valida o valor da mão de obra de uma ordem de serviço.
 */
export function validarValorMaoDeObra(valor: unknown): number {
  const valorNumerico = Number(valor ?? 0);

  if (!Number.isFinite(valorNumerico) || valorNumerico < 0) {
    throw new Error(
      'O valor da mão de obra deve ser um número válido e não negativo.'
    );
  }

  return valorNumerico;
}

/**
 * Valida a quantidade de materiais utilizada em uma OS.
 */
export function validarQuantidadeMaterial(quantidade: number): void {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error(
      'A quantidade de material deve ser um número inteiro maior que zero.'
    );
  }
}

/**
 * Impede alterações em ordens concluídas ou canceladas.
 */
export function validarOSPermiteAlteracao(status: string): void {
  if (status === 'CONCLUIDA' || status === 'CANCELADA') {
    throw new Error(
      'Não é possível alterar uma OS concluída ou cancelada.'
    );
  }
}
