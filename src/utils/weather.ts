export const getBeaufort = (speed: number) => {
  if (speed < 0.3) return 0;
  if (speed <= 1.5) return 1;
  if (speed <= 3.3) return 2;
  if (speed <= 5.4) return 3;
  if (speed <= 7.9) return 4;
  if (speed <= 10.7) return 5;
  if (speed <= 13.8) return 6;
  if (speed <= 17.1) return 7;
  return 8;
};

export const getStability = (tkkMin: number, tkkMax: number, tmdMin: number, tmdMax: number) => {
  const avgTkk = (tkkMin + tkkMax) / 2;
  const avgTmd = (tmdMin + tmdMax) / 2;
  if (avgTmd > avgTkk) return "ĐỐI LƯU";
  if (avgTmd < avgTkk) return "BÌNH LƯU";
  return "ĐẲNG NHIỆT";
};

export const renderTemp = (min: number, max: number) => {
  if (min === max) return `${min}`;
  return `${min}-${max}`;
};
