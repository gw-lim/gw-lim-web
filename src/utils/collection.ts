import dayjs from 'dayjs';

export const sortByDate = <T extends { data: { createdAt: string } }>(items: T[]): T[] => {
  return [...items].sort(
    (a, b) => dayjs(b.data.createdAt).valueOf() - dayjs(a.data.createdAt).valueOf(),
  );
};

export const getAllTags = <T extends { data: { tags: string[] } }>(items: T[]): string[] => {
  const tags = items.flatMap((item) => item.data.tags);
  return [...new Set(tags)].sort();
};

export const getSeriesPosts = <
  T extends { data: { seriesId?: string; createdAt: string } },
>(
  items: T[],
  seriesId: string,
): T[] => {
  return [...items]
    .filter((item) => item.data.seriesId === seriesId)
    .sort((a, b) => dayjs(a.data.createdAt).valueOf() - dayjs(b.data.createdAt).valueOf());
};
