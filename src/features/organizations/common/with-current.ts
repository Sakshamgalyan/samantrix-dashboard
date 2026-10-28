export const withCurrent = (
  options: { value: string; label: string }[],
  current: string,
): { value: string; label: string }[] =>
  current && !options.some((o) => o.value === current)
    ? [...options, { value: current, label: current }]
    : options;
