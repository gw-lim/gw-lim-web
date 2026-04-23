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
