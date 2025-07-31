export interface SuccessResponse<T> {
  ok: true;
  payload: T;
}

export interface PaginatedResponse<T> {
  ok: true;
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  payload: T[];
}
