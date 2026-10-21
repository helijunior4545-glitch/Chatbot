export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', {day:'2-digit', month:'short', year:'numeric'}).format(date);
};
