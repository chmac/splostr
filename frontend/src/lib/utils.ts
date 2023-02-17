export const dateToUnix = (date: Date = new Date()): number => {
  return Math.floor(date.getTime() / 1_000);
};
