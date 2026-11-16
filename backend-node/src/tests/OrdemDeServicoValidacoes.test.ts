
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  validarValorMaoDeObra,
  validarQuantidadeMaterial,
  validarOSPermiteAlteracao,
} from '../services/OrdemDeServicoValidacoes';

// TESTES: VALOR DA MÃO DE OBRA

test('Deve aceitar valor positivo de mão de obra', () => {
  assert.equal(validarValorMaoDeObra(150), 150);
});

test('Deve aceitar valor zero de mão de obra', () => {
  assert.equal(validarValorMaoDeObra(0), 0);
});

test('Deve rejeitar valor negativo de mão de obra', () => {
  assert.throws(() => validarValorMaoDeObra(-50));
});

test('Deve rejeitar valor inválido de mão de obra', () => {
  assert.throws(() => validarValorMaoDeObra('abc'));
});

// TESTES: QUANTIDADE DE MATERIAIS

test('Deve aceitar quantidade inteira positiva', () => {
  assert.doesNotThrow(() => validarQuantidadeMaterial(5));
});

test('Deve rejeitar quantidade zero', () => {
  assert.throws(() => validarQuantidadeMaterial(0));
});

test('Deve rejeitar quantidade negativa', () => {
  assert.throws(() => validarQuantidadeMaterial(-3));
});

test('Deve rejeitar quantidade decimal', () => {
  assert.throws(() => validarQuantidadeMaterial(2.5));
});

// TESTES: STATUS DA ORDEM DE SERVIÇO

test('Deve permitir alteração em OS aberta', () => {
  assert.doesNotThrow(() =>
    validarOSPermiteAlteracao('ABERTA')
  );
});

test('Deve impedir alteração em OS concluída', () => {
  assert.throws(() =>
    validarOSPermiteAlteracao('CONCLUIDA')
  );
});

test('Deve impedir alteração em OS cancelada', () => {
  assert.throws(() =>
    validarOSPermiteAlteracao('CANCELADA')
  );
});
