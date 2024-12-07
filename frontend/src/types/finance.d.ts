import { Dayjs } from 'dayjs';

export interface FinanceFilters {
  startDate?: Dayjs;
  endDate?: Dayjs;
  type?: string;
  status?: string;
} 