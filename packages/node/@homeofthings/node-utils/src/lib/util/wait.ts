export function wait(cond: () => boolean, timeout = 0, intervall = 100): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let counter = 0;
    const timer = setInterval(() => {
      if (cond()) {
        clearInterval(timer);
        resolve();
        return;
      }
      if (timeout > 0 && ++counter * intervall >= timeout) {
        clearInterval(timer);
        reject(new Error('timeout reached'));
        return;
      }
    }, intervall);
  });
}
