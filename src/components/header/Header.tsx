import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { border, margin } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useSelector, useStore } from "react-redux";
import SignInModal from "../modal/auth/SignInModal";
import { RootState } from "../../redux/store";
import { UserModel } from "../../model/UserModel";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import TextsmsIcon from "@mui/icons-material/Textsms";
import TaskIcon from "@mui/icons-material/Task";
import AccessAlarmsIcon from "@mui/icons-material/AccessAlarms";
import { Image } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { logout } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import WebSocketManager from "../../socket/WebSocketManager";
export default function Header() {
  const [modalSignIn, setModalSignIn] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await logout();
    WebSocketManager.getInstance().disconnect();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    if (response.success) {
      navigate("/login");
    } else {
      alert("Đăng xuất thất bại. Vui lòng thử lại");
    }
  };

  // const user = useSelector((state: RootState) => state.user)
  const color = "#76b5ff";
  const sizeFont = "24px";

  // const user: UserModel = {
  //     username: 'tai',
  //     email: '12@gmail.com'
  // }

  return (
    <>
      <>
        {" "}
        <Box
          sx={{
            width: "100%",
            height: "fit-content",
            padding: "15px",
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {user.username ? (
            <>
              <Box
                sx={{ display: "flex", width: "100%", alignItems: "center" }}
              >
                <Box
                  sx={{ width: "75%", display: "flex", alignItems: "center" }}
                >
                  <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
                    Trang chủ
                  </Typography>
                  <TextField
                    placeholder="Tìm kiếm"
                    sx={{
                      background: "#fff",
                      borderRadius: "10px",
                      marginLeft: "30px",

                      width: 250,
                      "& .MuiInputBase-root": {
                        height: 35,
                        fontSize: 14,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: color }} />
                        </InputAdornment>
                      ),
                    }}
                  ></TextField>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    width: "25%",
                    alignItems: "center",
                  }}
                >
                  <NewspaperIcon
                    sx={{ color: color, fontSize: sizeFont }}
                  ></NewspaperIcon>
                  <TextsmsIcon
                    sx={{
                      color: color,
                      fontSize: sizeFont,
                      marginLeft: "12px",
                    }}
                  ></TextsmsIcon>
                  <AccessAlarmsIcon
                    sx={{
                      color: color,
                      fontSize: sizeFont,
                      marginLeft: "12px",
                    }}
                  ></AccessAlarmsIcon>
                  <NotificationsActiveIcon
                    sx={{
                      color: color,
                      fontSize: sizeFont,
                      marginLeft: "12px",
                    }}
                  ></NotificationsActiveIcon>
                  <TaskIcon
                    sx={{
                      color: color,
                      fontSize: sizeFont,
                      marginLeft: "12px",
                    }}
                  ></TaskIcon>
                  <Box
                    component="img"
                    src="https://futbol-eros.com/wp-content/uploads/2022/12/Cristiano-Ronaldo-2008-Portrait-Poster-Wall-Art_FutbolEros-Closeup-1536x1536.jpg"
                    alt="avatar"
                    sx={{
                      borderRadius: "50%",
                      height: "40px",
                      width: "40px",
                      marginLeft: "12px",
                      cursor: "pointer",
                    }}
                  ></Box>
                </Box>
              </Box>
            </>
          ) : (
            <>
              {" "}
              <Typography
                component={"h1"}
                sx={{ marginY: "auto", fontSize: "17px", fontWeight: "400" }}
              >
                Trang chủ
              </Typography>
              <Box>
                <Button
                  sx={{
                    borderRadius: "10px",
                    background: "rgb(55, 145, 250)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Box>
            </>
          )}
        </Box>
        <SignInModal
          open={modalSignIn}
          setModal={setModalSignIn}
        ></SignInModal>{" "}
      </>
    </>
  );
}
