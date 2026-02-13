export const getDynamicColour = (
  numerator: number,
  denominator: number,
  hue: number,
  lightness: number = 51
) => {
  const masterPercent =
    numerator && denominator ? Math.min(numerator / denominator, 1) : 0;

  const dynamicColor = `hsl(${hue}, 100%, ${masterPercent * lightness}%)`;

  return dynamicColor;
};
