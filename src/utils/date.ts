import dayjs from 'dayjs';

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY. MM. DD');
};

export const formatDateFull = (date: string): string => {
  return dayjs(date).format('YYYY년 MM월 DD일');
};
