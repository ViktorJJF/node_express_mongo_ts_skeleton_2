export type ISuccessResponse<T> = {
  ok: true;
  payload: T;
};

export type IValidationError = {
  field: string;
  message: string;
};

export type IErrorResponse = {
  success: false;
  errors: IValidationError[];
};

export type IApiResponse<T> = ISuccessResponse<T> | IErrorResponse;
