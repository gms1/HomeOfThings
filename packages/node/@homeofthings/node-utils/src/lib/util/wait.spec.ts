import { wait } from './wait';

describe('wait', () => {
  it('should resolve when condition is met', async () => {
    let givenCondition = false;
    setTimeout(() => {
      givenCondition = true;
    }, 300);

    await wait(() => givenCondition, 600);
  });

  it('should reject when timing out on waiting for condition', async () => {
    try {
      await wait(() => false, 300);
      fail('should have thrown');
    } catch {
      return;
    }
  });
});
