export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const formatDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const createId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};
