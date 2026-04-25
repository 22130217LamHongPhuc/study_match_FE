export enum APIResponse {
  success = "Success",
  error = "Error",
  SUCCESS = "Success",
  ERROR = "Error",
}

export interface APIResponseData<T> {
  success: boolean;
  status: APIResponse;
  message?: string;
  data: T;
}
