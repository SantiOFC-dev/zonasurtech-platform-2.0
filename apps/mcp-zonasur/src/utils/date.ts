export const todayBounds = (): { start: string; end: string; day: string } => {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  return {
    day,
    start: `${day}T00:00:00.000Z`,
    end: `${day}T23:59:59.999Z`
  };
};

export const periodBounds = (period: "today" | "this_week" | "this_month"): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString();

  if (period === "today") {
    const { start } = todayBounds();
    return { start, end };
  }

  if (period === "this_week") {
    const day = now.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    return { start: monday.toISOString(), end };
  }

  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  return { start: monthStart.toISOString(), end };
};
