import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, restoreLesson, unlockedLesson } from './godelLesson.js';

test('Lección: los errores permiten reintentar, las soluciones y explicaciones abren el siguiente reto', () => {
  const responses = {},
    revealed = [];
  assert.equal(unlockedLesson(responses, revealed), 0);
  responses[lessons[0].id] = (lessons[0].correct + 1) % lessons[0].options.length;
  assert.equal(unlockedLesson(responses, revealed), 0);
  revealed.push(lessons[0].id);
  assert.equal(unlockedLesson(responses, revealed), 1);
  responses[lessons[1].id] = lessons[1].correct;
  assert.equal(unlockedLesson(responses, revealed), 2);
  // A later saved answer must not bypass a pending lesson.
  responses[lessons[4].id] = lessons[4].correct;
  assert.equal(unlockedLesson(responses, revealed), 2);
  for (const lesson of lessons) responses[lesson.id] = lesson.correct;
  assert.equal(unlockedLesson(responses, []), lessons.length - 1);
});

test('Lección: restaura un avance válido y acota datos dañados del navegador', () => {
  const saved = {
    current: 2,
    responses: { [lessons[0].id]: lessons[0].correct },
    revealed: [lessons[1].id],
    notebook: 'Mi explicación',
  };
  assert.deepEqual(restoreLesson(JSON.parse(JSON.stringify(saved))), saved);
  assert.deepEqual(restoreLesson(null), { current: 0, responses: {}, revealed: [], notebook: '' });
  for (const value of [false, 1, 'texto', [], {}]) assert.equal(restoreLesson(value).current, 0);
  const invalid = restoreLesson({
    current: 900,
    responses: { [lessons[0].id]: -1, [lessons[1].id]: '2' },
    revealed: ['inexistente'],
    notebook: 'a'.repeat(5000),
  });
  assert.equal(invalid.current, 0);
  assert.deepEqual(invalid.responses, {});
  assert.deepEqual(invalid.revealed, []);
  assert.equal(invalid.notebook.length, 4000);
  assert.equal(restoreLesson({ current: -8 }).current, 0);
});
