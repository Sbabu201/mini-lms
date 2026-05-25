// ─── API Response Types ─────────────────────────────────────────────

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedData<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}

export interface ApiError {
  statusCode: number;
  message: string;
  success: false;
  errors?: Array<{ field: string; message: string }>;
}
