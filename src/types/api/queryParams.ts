export type IBaseQueryParams = {
  filters?: string;
  fields?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  select?: string;
};
