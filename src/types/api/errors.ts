export interface IApiError {
  msg: string;
  code: number;
}

export interface IApiErrorResponse {
  errors: IApiError;
}

export interface IValidationError {
  field: string;
  message: string;
}

export interface IValidationErrorResponse {
  errors: IValidationError[];
}

export type IServiceError = IApiErrorResponse | IValidationErrorResponse;

export interface IErrorHandlerOptions {
  showToast?: boolean;
  operation?: string;
  fallbackMessage?: string;
}
