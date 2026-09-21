export function toIso(d: Date): string {
  const m = `0${d.getMonth() + 1}`.slice(-2);
  const dd = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${m}-${dd}`;
}

export function fromIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday-based, matching the Swedish calendar and Postgres' date_trunc('week'). */
export function weekStart(d: Date): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}

export function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
