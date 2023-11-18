export function failTest(reason: string | Error = 'fail was called in a test.') {
  if (typeof reason === 'string') {
    throw new Error(reason);
  } else {
    throw reason;
  }
}
