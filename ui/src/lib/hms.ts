export const hms = (s: number) => {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(s / day);
  const hours = Math.floor((s % day) / hour);
  const minutes = Math.floor((s % hour) / minute);
  const seconds = Math.floor(s % minute);

  let o = "";
  if (days > 0) o += `${days}d `;
  if (hours > 0) o += `${hours}h `;
  if (minutes > 0) o += `${minutes}m `;
  if (seconds > 0) o += `${seconds}s `;

  return o.trim();
};
