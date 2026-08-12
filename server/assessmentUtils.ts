export const CESD_REVERSE_INDEXES = new Set([3, 7, 11, 15]);
export const PSS_REVERSE_INDEXES = new Set([3, 4, 5, 6, 7]);

function validateAnswers(answers: number[], expectedLength: number, min: number, max: number) {
  if (answers.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} answers, received ${answers.length}.`);
  }

  if (answers.some(answer => !Number.isInteger(answer) || answer < min || answer > max)) {
    throw new Error(`Answers must be integers between ${min} and ${max}.`);
  }
}

export function scoreCesd(answers: number[]) {
  validateAnswers(answers, 20, 0, 3);

  return answers.reduce(
    (total, answer, index) => total + (CESD_REVERSE_INDEXES.has(index) ? 3 - answer : answer),
    0,
  );
}

export function scorePss(answers: number[]) {
  validateAnswers(answers, 10, 0, 4);

  return answers.reduce(
    (total, answer, index) => total + (PSS_REVERSE_INDEXES.has(index) ? 4 - answer : answer),
    0,
  );
}
