import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Popover,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SignInModal from "../modal/auth/SignInModal";
import { RootState } from "../../redux/store";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TextsmsIcon from "@mui/icons-material/Textsms";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { logout } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import WebSocketManager from "../../socket/WebSocketManager";
import {
  loadFriendRequestsService,
  loadFriendProfilesService,
  updateFriendRequestStatusService,
  FriendUser,
  FriendRequestDto
} from "../../services/FriendService";
import { toast } from "sonner";

export default function Header() {
  const [modalSignIn, setModalSignIn] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<null | HTMLElement>(null);
  const [pendingRequests, setPendingRequests] = useState<(FriendRequestDto & { sender?: FriendUser })[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const newMess = useSelector((state: RootState) => state.chat.newMess);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("accessToken") ? true : false;

  const fetchPendingRequests = async () => {
    try {
      const data = await loadFriendRequestsService();
      const pendingReceived = data.received.filter((req) => req.status === "PENDING");
      
      if (pendingReceived.length === 0) {
        setPendingRequests([]);
        return;
      }
      
      const senderIds = Array.from(new Set(pendingReceived.map((req) => req.senderId)));
      const profiles = await loadFriendProfilesService(senderIds);
      
      const requestsWithProfiles = pendingReceived.map((req) => {
        const senderProfile = profiles.find((p) => p.userId === req.senderId);
        return {
          ...req,
          sender: senderProfile
        };
      });
      
      setPendingRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Lỗi khi tải danh sách kết bạn:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setPendingRequests([]);
      return;
    }
    
    fetchPendingRequests();
    
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    if (newMess) {
      if (newMess.event === "FRIEND_REQUEST_RECEIVE") {
        fetchPendingRequests();
        toast.info("Bạn có một lời mời kết bạn mới!");
      } else if (newMess.event === "FRIEND_REQUEST_ACCEPT_RECEIVE") {
        toast.success("Lời mời kết bạn đã được chấp nhận!");
        window.dispatchEvent(new Event("friend_status_updated"));
      }
    }
  }, [newMess]);


  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setPopoverAnchor(null);
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await updateFriendRequestStatusService(requestId, "APPROVED");
      const responseCode = Number(response.code);
      if (responseCode >= 200 && responseCode < 300) {
        toast.success("Đã chấp nhận lời mời kết bạn!");
        
        const req = pendingRequests.find((r) => r.id === requestId);
        const currentUserId = Number(localStorage.getItem("userId"));
        if (req && currentUserId) {
          try {
            WebSocketManager.getInstance().sendMessage("/chat/send", {
              event: "FRIEND_REQUEST_ACCEPT",
              data: {
                senderId: currentUserId,
                receiverId: req.senderId
              }
            });
          } catch (socketErr) {
            console.error("Failed to emit FRIEND_REQUEST_ACCEPT socket event", socketErr);
          }
        }


        fetchPendingRequests();
        window.dispatchEvent(new Event("friend_status_updated"));
      } else {
        toast.error("Thao tác thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi.");
    }
  };


  const handleDeclineRequest = async (requestId: number) => {
    try {
      const response = await updateFriendRequestStatusService(requestId, "REJECTED");
      const responseCode = Number(response.code);
      if (responseCode >= 200 && responseCode < 300) {
        toast.success("Đã từ chối lời mời kết bạn.");
        fetchPendingRequests();
        window.dispatchEvent(new Event("friend_status_updated"));
      } else {
        toast.error("Thao tác thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi.");
    }
  };

  const handleLogout = async () => {
    WebSocketManager.getInstance().disconnect();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    const response = await logout();
    if (response.success) {
      navigate("/login");
    } else {
      alert("Đăng xuất thất bại. Vui lòng thử lại");
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleGoProfile = () => {
    handleCloseMenu();
    navigate("/my-profile");
  };

  const handleGoSettings = () => {
    handleCloseMenu();
    navigate("/my-profile");
  };

  const handleOpenSignIn = () => {
    handleCloseMenu();
    setModalSignIn(true);
  };

  const handleGoRegister = () => {
    handleCloseMenu();
    navigate("/register");
  };

  const hanldeLougout = async () => {
    const response = await logout();

    WebSocketManager.getInstance().disconnect();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    if (response.success) {
      navigate("/login");
    }
  };

  return (
    <>
      <>
        <Box
          sx={{
            width: "100%",
            height: "fit-content",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0e6d9",
            background: "#ffffff",
          }}
        >
          {isLoggedIn ? (
            <>
              <Box
                sx={{ display: "flex", width: "100%", alignItems: "center" }}
              >
                <Box
                  sx={{ width: "75%", display: "flex", alignItems: "center" }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1f2937",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    Trang chủ
                  </Typography>
                  <TextField
                    placeholder="Tìm kiếm bạn học, nhóm..."
                    sx={{
                      background: "#fafaf8",
                      borderRadius: "10px",
                      marginLeft: "24px",
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        "& fieldset": {
                          borderColor: "#e5e0d8",
                        },
                        "&:hover fieldset": {
                          borderColor: "#f97316",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#f97316",
                          borderWidth: "1.5px",
                        },
                      },
                      "& .MuiInputBase-root": {
                        height: 38,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#374151",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
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
                    gap: "8px",
                  }}
                >
                  <Tooltip title="Tin nhắn">
                    <IconButton
                      sx={{
                        bgcolor: "#fff7ed",
                        "&:hover": { bgcolor: "#ffedd5" },
                      }}
                    >
                      <TextsmsIcon
                        sx={{ color: "#f97316", fontSize: "20px" }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Thông báo">
                    <IconButton
                      onClick={handleOpenNotifications}
                      sx={{
                        bgcolor: "#fff7ed",
                        "&:hover": { bgcolor: "#ffedd5" },
                      }}
                    >
                      <Badge
                        color="error"
                        variant="dot"
                        invisible={pendingRequests.length === 0}
                      >
                        <NotificationsActiveIcon
                          sx={{ color: "#f97316", fontSize: "20px" }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Button
                    onClick={handleOpenMenu}
                    endIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      padding: "5px 10px",
                      background: "#fafaf8",
                      border: "1px solid #e5e0d8",
                      color: "#1f2937",
                      gap: "6px",
                      minWidth: "auto",
                      "&:hover": {
                        background: "#fff7ed",
                        borderColor: "#f97316",
                      },
                    }}
                  >
                    <Avatar
                      src="https://futbol-eros.com/wp-content/uploads/2022/12/Cristiano-Ronaldo-2008-Portrait-Poster-Wall-Art_FutbolEros-Closeup-1536x1536.jpg"
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box sx={{ textAlign: "left" }}>
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}
                      >
                        {user?.username || "StudyMate"}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                        Học viên
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography
                component={"h1"}
                sx={{
                  marginY: "auto",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                Trang chủ
              </Typography>
              <Box>
                <Button
                  onClick={handleOpenMenu}
                  endIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    padding: "5px 10px",
                    background: "#fafaf8",
                    border: "1px solid #e5e0d8",
                    color: "#1f2937",
                    gap: "6px",
                    "&:hover": {
                      background: "#fff7ed",
                      borderColor: "#f97316",
                    },
                  }}
                >
                  <Avatar sx={{ width: 30, height: 30, bgcolor: "#fff7ed" }}>
                    <PersonOutlineIcon sx={{ color: "#f97316" }} />
                  </Avatar>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}
                    >
                      Tài khoản
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                      Đăng nhập để tiếp tục
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </>
          )}
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: "10px",
              minWidth: 210,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid #f0e6d9",
              px: 0.5,
            },
          }}
        >
          {isLoggedIn ? (
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}
              >
                {user?.username}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                {user?.email || ""}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}
              >
                Chào bạn
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                Đăng nhập để kết nối bạn bè
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 0.5, borderColor: "#f0e6d9" }} />
          {isLoggedIn ? (
            <>
              <MenuItem
                onClick={handleGoProfile}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <PersonOutlineIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Hồ sơ của tôi
              </MenuItem>
              <MenuItem
                onClick={handleGoSettings}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <SettingsOutlinedIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Cài đặt tài khoản
              </MenuItem>
              <MenuItem
                onClick={handleCloseMenu}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <HelpOutlineIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Hỗ trợ
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: "#f0e6d9" }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#ef4444",
                  py: 1,
                  "&:hover": { bgcolor: "#fef2f2" },
                }}
              >
                <LogoutOutlinedIcon
                  sx={{ fontSize: 17, mr: 1, color: "#ef4444" }}
                />
                Đăng xuất
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem
                onClick={handleOpenSignIn}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <PersonOutlineIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Đăng nhập
              </MenuItem>
              <MenuItem
                onClick={handleGoRegister}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <SettingsOutlinedIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Tạo tài khoản
              </MenuItem>
              <MenuItem
                onClick={handleCloseMenu}
                sx={{
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "#374151",
                  py: 1,
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                }}
              >
                <HelpOutlineIcon
                  sx={{ fontSize: 17, mr: 1, color: "#9ca3af" }}
                />
                Hỗ trợ
              </MenuItem>
            </>
          )}
        </Menu>
        <SignInModal open={modalSignIn} setModal={setModalSignIn}></SignInModal>

        <Popover
          anchorEl={popoverAnchor}
          open={Boolean(popoverAnchor)}
          onClose={handleCloseNotifications}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 320,
              maxWidth: "100%",
              maxHeight: 400,
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid #f0e6d9",
              padding: "12px",
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "14px",
              color: "#1f2937",
              mb: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Thông báo kết bạn
            {pendingRequests.length > 0 && (
              <Badge
                badgeContent={pendingRequests.length}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    position: "static",
                    transform: "none",
                  },
                }}
              />
            )}
          </Typography>
          <Divider sx={{ mb: 1, borderColor: "#f0e6d9" }} />
          {pendingRequests.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Không có lời mời kết bạn mới
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pendingRequests.map((req) => (
                <Box
                  key={req.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#fafaf8",
                    border: "1px solid #f0e6d9",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar
                      src={req.sender?.avatarUrl || undefined}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#1f2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {req.sender?.fullName || "Người dùng StudyMatch"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "#6b7280",
                        }}
                      >
                        Muốn kết bạn với bạn
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDeclineRequest(req.id)}
                      sx={{
                        fontSize: "11px",
                        textTransform: "none",
                        color: "#ef4444",
                        borderColor: "#fca5a5",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        minWidth: "60px",
                        "&:hover": {
                          backgroundColor: "#fef2f2",
                          borderColor: "#ef4444",
                        },
                      }}
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleAcceptRequest(req.id)}
                      sx={{
                        fontSize: "11px",
                        textTransform: "none",
                        backgroundColor: "#f97316",
                        color: "#ffffff",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        minWidth: "60px",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#ea580c",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Chấp nhận
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Popover>
      </>
    </>
  );
}
