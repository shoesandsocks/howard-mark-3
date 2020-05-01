export default () => {
  const now = new Date();
  const today = now.toLocaleString();
  // TODO: this is multi-lined but could be used
  // elsewhere to do more, so I'm leaving it.
  return today;
};
