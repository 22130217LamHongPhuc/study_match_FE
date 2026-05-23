import { BASE_URL } from "../config/BaseConfig";

type FormLogin = {
  email: string;
  password: string;
};
export const loginRequest = async (form: FormLogin) => {
  const url = BASE_URL + "/users/login";
  console.log(url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form.email,
      password: form.password,
    }),
  });
  const data = await res.json();

  console.log(data);

  return data;
};

export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

type UpdateAdminUserStatusResponse = {
  id: number;
  status: AdminUserStatus;
};

export async function updateAdminUserStatus(
  userId: number,
  status: AdminUserStatus,
) {
  try {
    // const res = await http.patch<ApiResponse<UpdateAdminUserStatusResponse>>(
    //   `/api/admin/users/${userId}/status`,
    //   { status },
    // );

    // return {
    //   success: true,
    //   data: res.data.data,
    //   message: res.data.message,
    // };

    return {
      success: true,
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message:
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái người dùng",
    };
  }
}
