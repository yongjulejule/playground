export const isDebugEnabled = (): boolean => process.env.DEBUG === 'true';

export const debugAction = <T>(action: () => T): void => {
  if (isDebugEnabled()) {
    action();
  }
};
