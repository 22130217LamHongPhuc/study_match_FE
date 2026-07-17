import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Search, MessageSquare, UserMinus, ChevronDown } from "lucide-react";
import { Avatar, Dialog, DialogTitle, DialogContent, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SocketEvent } from "../../../enum/SocketEvent";
import {
  loadAllFriendsService,
  unfriendService,
  FriendUser
} from "../../../services/FriendService";
import WebSocketManager from "../../../socket/WebSocketManager";
import { LoadingState, EmptyState } from "./SharedStates";
import { RootState } from "../../../redux/store";

export default function MyFriendsSection() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "online">("all");
  const [sortBy, setSortBy] = useState<string>("connected");
  const [unfriendConfirmOpen, setUnfriendConfirmOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();

  const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const list = await loadAllFriendsService();
      setFriends(list);
    } catch (error) {
      console.error("Failed to load friends:", error);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (
      socketEvent === "FRIEND_REQUEST_ACCEPT_RECEIVE" ||
      socketEvent === "friend_status_updated"
    ) {
      loadData();
    }
  }, [socketEvent, loadData]);

  const handleChat = (friend: FriendUser) => {
    navigate("/conversation", {
      state: {
        conversationKind: "PRIVATE",
        targetUserId: friend.userId,
        avatar: friend.avatarUrl,
        fullName: friend.fullName,
      },
    });
  };

  const handleUnfriendClick = (friendId: number, name: string) => {
    setSelectedFriend({ id: friendId, name });
    setUnfriendConfirmOpen(true);
  };

  const handleConfirmUnfriend = async () => {
    if (!selectedFriend) return;
    const { id: friendId, name } = selectedFriend;
    setUnfriendConfirmOpen(false);

    try {
      setActionLoading(friendId);
      const currentUserId = Number(localStorage.getItem("userId"));
      if (!currentUserId) throw new Error("User ID not found");

      const res = await unfriendService(currentUserId, friendId);
      if (res && res.code && Number(res.code) >= 400) {
        throw new Error(res.message || "Failed to unfriend");
      }

      try {
        WebSocketManager.getInstance().sendMessage("/chat/send", {
          event: SocketEvent.FRIEND_REQUEST_CANCEL,
          data: {
            senderId: currentUserId,
            receiverId: friendId,
          },
        });
      } catch (socketErr) {
        console.error("Failed to emit FRIEND_REQUEST_CANCEL socket event", socketErr);
      }

      setFriends((prev) => prev.filter((f) => f.userId !== friendId));
      window.dispatchEvent(new Event("friend_status_updated"));
    } catch (error: any) {
      console.error(error);
      toast.error("Hủy kết bạn thất bại");
    } finally {
      setActionLoading(null);
      setSelectedFriend(null);
    }
  };

  const handleGoProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const filteredFriends = useMemo(() => {
    let list = friends;

    // 1. Filter by search query
    const query = searchText.trim().toLowerCase();
    if (query) {
      list = list.filter((f) => f.fullName.toLowerCase().includes(query));
    }

    // 2. Filter by status tabs
    if (activeFilter === "online") {
      list = list.filter((f) => f.online);
    }

    // 3. Sort
    if (sortBy === "name-asc") {
      list = [...list].sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));
    } else if (sortBy === "name-desc") {
      list = [...list].sort((a, b) => b.fullName.localeCompare(a.fullName, "vi"));
    }

    return list;
  }, [friends, searchText, activeFilter, sortBy]);

  if (loading) {
    return <LoadingState label="Đang tải danh sách bạn bè..." />;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="space-y-6">
        {/* Row 1: Filter tabs & Sort select */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveFilter("online")}
              className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${activeFilter === "online"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${activeFilter === "online" ? "bg-white" : "bg-green-500"}`} />
              Online
            </button>
          </div>

          {/* Right: Sort select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="connected">Mới kết nối</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Search input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Friends list grid */}
        {filteredFriends.length === 0 ? (
          <EmptyState
            title={searchText.trim() ? "Không tìm thấy bạn bè phù hợp" : "Chưa kết nối bạn học nào"}
            description={
              searchText.trim()
                ? "Hãy thử tìm kiếm bằng một từ khóa khác."
                : "Bạn có thể vào tab 'Gợi ý bạn học' để gửi lời mời kết bạn và bắt đầu học tập cùng nhau."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFriends.map((friend) => {
              const displayName = friend.fullName || "";

              return (
                <div
                  key={friend.userId}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  {/* Profile detail section */}
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => handleGoProfile(friend.userId)}
                      className="relative cursor-pointer transition-transform hover:scale-105 shrink-0"
                    >
                      <Avatar
                        src={friend.avatarUrl || undefined}
                        alt={displayName}
                        className="h-12 w-12 border-2 border-blue-500/10"
                        sx={{ width: 48, height: 48 }}
                      />
                      {/* Status Dot */}
                      <span
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${friend.online ? "bg-green-500" : "bg-gray-300"
                          }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        onClick={() => handleGoProfile(friend.userId)}
                        className="cursor-pointer text-sm font-bold text-gray-800 hover:text-blue-500 hover:underline line-clamp-1"
                      >
                        {displayName}
                      </h3>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${friend.online
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {friend.online ? "Trực tuyến" : "Ngoại tuyến"}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-100" />

                  {/* Actions */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleUnfriendClick(friend.userId, displayName)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                    >
                      <UserMinus size={14} />
                      Hủy kết bạn
                    </button>
                    <button
                      onClick={() => handleChat(friend)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-500 text-xs font-semibold text-white transition-colors hover:bg-blue-600 shadow-sm shadow-blue-500/10 disabled:opacity-50"
                    >
                      <MessageSquare size={14} />
                      Nhắn tin
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Unfriend Confirm */}
      <Dialog
        open={unfriendConfirmOpen}
        onClose={() => {
          setUnfriendConfirmOpen(false);
          setSelectedFriend(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: "15px",
            padding: "10px",
          }
        }}
      >LeaveStudySessionResponse
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Hủy kết bạn
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center", mb: 2 }}>
            Bạn có chắc chắn muốn hủy kết bạn với <strong>{selectedFriend?.name}</strong> không?
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setUnfriendConfirmOpen(false);
                setSelectedFriend(null);
              }}
              sx={{ borderRadius: "20px", px: 4, textTransform: "none" }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmUnfriend}
              sx={{ borderRadius: "20px", px: 4, textTransform: "none" }}
            >
              Đồng ý
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </section>
  );
}
