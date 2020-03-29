import contains from './helper';

const { module, test } = QUnit;

module('Helper: contains', function(hooks) {
  test('it computes', function(assert) {
    assert.equal(contains([]), undefined);
  });
});
