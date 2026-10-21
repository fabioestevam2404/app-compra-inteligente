const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./helpers/ambiente');

test('CA-GER-05 com armazenamento bloqueado o app funciona em memória durante a sessão', () => {
  const bloqueado = {
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('SecurityError');
    },
    removeItem() {
      throw new Error('SecurityError');
    },
  };
  const { Store, Lista } = carregar({ armazenamento: bloqueado });
  assert.equal(Store.disponivel(), false);
  Lista.adicionar({ nome: 'Tomate', categoria: '', quantidade: 1, unidade: '' });
  assert.ok(Lista.todos().some((i) => i.nome === 'Tomate'));
  assert.equal(Store.get('lista', null).some((i) => i.nome === 'Tomate'), true);
});
