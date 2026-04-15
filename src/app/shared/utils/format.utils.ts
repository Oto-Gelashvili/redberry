export function formatName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTimeSlotLabel(label: string): string {
  return label.replace(/[()]/g, '').trim();
}
