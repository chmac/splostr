export default (date: Date = new Date()): number => {
  return Math.floor(date.getTime() / 1000);
};
