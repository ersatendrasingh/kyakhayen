export function getFormattedDateTime() {
  const currentDate = new Date();

  const pad = (n: number) => (n < 10 ? "0" + n : n);

  const year = currentDate.getFullYear();
  const month = pad(currentDate.getMonth() + 1);
  const day = pad(currentDate.getDate());
  const hours = pad(currentDate.getHours());
  const minutes = pad(currentDate.getMinutes());

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

  return formattedDateTime;
}
