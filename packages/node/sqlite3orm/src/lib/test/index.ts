export function failTest(reason: unknown = 'fail was called in a test.') {
  if (typeof reason === 'string') {
    throw new Error(reason);
  } else {
    throw reason;
  }
}
