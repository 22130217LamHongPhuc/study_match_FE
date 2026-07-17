export enum APIResponse {

  success = "Success",
  error = "Error",
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  ACCESS_DENIED = "ACCESS_DENIED",
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  INVALID_FILE = "INVALID_FILE",
  PASSWORD_INCORRECT = "PASSWORD_INCORRECT",
  SUCCESS = "SUCCESS",
}

export enum StatusCode {
  INVALID_TOKEN = "INVALID_TOKEN",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  ACCESS_DENIED = "ACCESS_DENIED",
  EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
  INVALID_FILE = "INVALID_FILE",
  PASSWORD_INCORRECT = "PASSWORD_INCORRECT",
  SUCCESS = "SUCCESS",
  USER_LOCKED = "USER_LOCKED",
}

export const StatusMessage: Record<StatusCode, string> = {
  [StatusCode.INVALID_TOKEN]: "Token không hợp lệ",
  [StatusCode.INVALID_REFRESH_TOKEN]: "Refresh token không hợp lệ",
  [StatusCode.USER_NOT_FOUND]: "Không tìm thấy user",
  [StatusCode.INTERNAL_SERVER_ERROR]: "Lỗi server",
  [StatusCode.UNAUTHORIZED]: "Chưa đăng nhập",
  [StatusCode.ACCESS_DENIED]: "Không có quyền truy cập",
  [StatusCode.EMAIL_ALREADY_IN_USE]: "Email đã được sử dụng",
  [StatusCode.INVALID_FILE]: "File không hợp lệ",
  [StatusCode.PASSWORD_INCORRECT]: "Sai mật khẩu",
  [StatusCode.SUCCESS]: "Thành công",
  [StatusCode.USER_LOCKED]: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động bởi quản trị viên",
};
export interface APIResponseData<T> {
  success: boolean;
  code: StatusCode;
  message?: string;
  data: T;
}
