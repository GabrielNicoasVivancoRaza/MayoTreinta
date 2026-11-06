export function centsToDisplay(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

export function displayToCents(value) {
  return Math.round(Number(value || 0) * 100);
}
