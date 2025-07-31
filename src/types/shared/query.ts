export interface ListQuery {
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
  limit?: string;
  filter?: string;
  fields?: string;
}
