export interface IModelPopulated {
  path: string;
  select?: string;
  populate?: IModelPopulated[];
}

// Pagination interfaces
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query options interface
export interface IQueryOptions {
  select?: string | string[];
  populate?: IModelPopulated | IModelPopulated[];
  sort?: string | Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

// Service response interface
export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
