import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Mail, Check, X, Send } from "lucide-react";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  loadFriendRequestsService,
  loadFriendProfilesService,
  updateFriendRequestStatusService,
  FriendUser,
  FriendRequestDto
} from "../../../services/FriendService";
import { LoadingState, EmptyState } from "./SharedStates";
import WebSocketManager from "../../../socket/WebSocketManager";
import { RootState } from "../../../redux/store";

type RequestWithProfile = FriendRequestDto & {
  userProfile?: FriendUser | null;
};

function formatRequestDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `lúc ${hours}:${minutes}`;
  } else if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

export default function FriendRequestsSection() {
  const [receivedRequests, setReceivedRequests] = useState<RequestWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"received" | "sent">("received");
  const navigate = useNavigate();

  const socketEvent = useSelector((state: RootState) => state.chat.newMess?.event);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadFriendRequestsService();

      const pendingReceived = data.received.filter((req) => req.status === "PENDING");
      const pendingSent = data.sent.filter((req) => req.status === "PENDING");

      const senderIds = pendingReceived.map((req) => req.senderId);
      const receiverIds = pendingSent.map((req) => req.receiverId);
      const allUserIds = Array.from(new Set([...senderIds, ...receiverIds]));

      if (allUserIds.length === 0) {
        setReceivedRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      const profiles = await loadFriendProfilesService(allUserIds);

      const receivedWithProfiles = pendingReceived.map((req) => ({
        ...req,
        userProfile: profiles.find((p) => p.userId === req.senderId) || null,
      }));

      const sentWithProfiles = pendingSent.map((req) => ({
        ...req,
        userProfile: profiles.find((p) => p.userId === req.receiverId) || null,
      }));

      setReceivedRequests(receivedWithProfiles);
      setSentRequests(sentWithProfiles);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
      toast.error("Không thể tải danh sách lời mời kết bạn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (
      socketEvent === "FRIEND_REQUEST_RECEIVE" ||
      socketEvent === "FRIEND_REQUEST_ACCEPT_RECEIVE" ||
      socketEvent === "FRIEND_REQUEST_CANCEL_RECEIVE"
    ) {
      loadData();
    }
  }, [socketEvent, loadData]);

  const handleAccept = async (requestId: number, name?: string) => {
    try {
      setActionLoading(requestId);
      const res = await updateFriendRequestStatusService(requestId, "APPROVED");
      if (res && res.code && Number(res.code) >= 400) {
        throw new Error(res.message || "Failed to accept request");
      }

      // Emit socket event to notify other user in real-time
      const currentUserId = Number(localStorage.getItem("userId"));
      const originalRequest = receivedRequests.find((r) => r.id === requestId);
      if (originalRequest && currentUserId) {
        try {
          WebSocketManager.getInstance().sendMessage("/chat/send", {
            event: "FRIEND_REQUEST_ACCEPT",
            data: {
              senderId: currentUserId,
              receiverId: originalRequest.senderId
            }
          });
        } catch (socketErr) {
          console.error("Failed to emit FRIEND_REQUEST_ACCEPT socket event", socketErr);
        }
      }

      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event("friend_status_updated"));
    } catch (error: any) {
      console.error(error);
      toast.error("Không thể chấp nhận lời mời");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: number, name?: string) => {
    try {
      setActionLoading(requestId);
      const res = await updateFriendRequestStatusService(requestId, "REJECTED");
      if (res && res.code && Number(res.code) >= 400) {
        throw new Error(res.message || "Failed to decline request");
      }
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event("friend_status_updated"));
    } catch (error: any) {
      console.error(error);
      toast.error("Không thể từ chối lời mời");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId: number, name?: string) => {
    try {
      setActionLoading(requestId);
      const res = await updateFriendRequestStatusService(requestId, "CANCELLED");
      if (res && res.code && Number(res.code) >= 400) {
        throw new Error(res.message || "Failed to cancel request");
      }
      // Emit socket event to notify other user in real-time
      const currentUserId = Number(localStorage.getItem("userId"));
      const originalRequest = sentRequests.find((r) => r.id === requestId);
      if (originalRequest && currentUserId) {
        try {
          WebSocketManager.getInstance().sendMessage("/chat/send", {
            event: "FRIEND_REQUEST_CANCEL",
            data: {
              senderId: currentUserId,
              receiverId: originalRequest.receiverId
            }
          });
        } catch (socketErr) {
          console.error("Failed to emit FRIEND_REQUEST_CANCEL socket event", socketErr);
        }
      }

      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      window.dispatchEvent(new Event("friend_status_updated"));
    } catch (error: any) {
      console.error(error);
      toast.error("Không thể thu hồi lời mời");
    } finally {
      setActionLoading(null);
    }
  };

  const handleGoProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <LoadingState label="Đang tải danh sách lời mời kết bạn..." />;
  }

  const activeRequests = activeSubTab === "received" ? receivedRequests : sentRequests;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="space-y-6">
        {/* Sub tabs navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSubTab("received")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all ${activeSubTab === "received"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Mail size={16} />
            Lời mời đã nhận
            {receivedRequests.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("sent")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all ${activeSubTab === "sent"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Send size={16} />
            Lời mời đã gửi
            {sentRequests.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-400 px-1 text-xs font-bold text-white">
                {sentRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Requests Grid */}
        {activeRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img
              src="https://app.studystream.live/assets/images/onboarding-slides/intro-slide.png"
              alt="No friend requests"
              className="mx-auto mb-4 w-96 h-auto object-contain"
            />
            <p className="text-sm font-semibold text-gray-500">
              Không có lời mời kết bạn nào
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeRequests.map((req) => {
              const profile = req.userProfile;
              const displayName = profile?.fullName || "";
              const userId = activeSubTab === "received" ? req.senderId : req.receiverId;

              return (
                <div
                  key={req.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  {/* Profile section */}
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => handleGoProfile(userId)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <Avatar
                        src={profile?.avatarUrl || undefined}
                        alt={displayName}
                        className="h-12 w-12 border-2 border-blue-500/10"
                        sx={{ width: 48, height: 48 }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        onClick={() => handleGoProfile(userId)}
                        className="cursor-pointer text-sm font-bold text-gray-800 hover:text-blue-500 hover:underline line-clamp-1"
                      >
                        {displayName}
                      </h3>
                      {req.createdAt && (
                        <p className="mt-1 text-[10px] text-gray-400">
                          Đã gửi {formatRequestDate(req.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-100" />

                  {/* Actions section */}
                  <div className="flex gap-2.5">
                    {activeSubTab === "received" ? (
                      <>
                        <button
                          onClick={() => handleDecline(req.id, displayName)}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                        >
                          <X size={14} />
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAccept(req.id, displayName)}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-500 text-xs font-semibold text-white transition-colors hover:bg-blue-600 shadow-sm shadow-blue-500/10 disabled:opacity-50"
                        >
                          <Check size={14} />
                          Chấp nhận
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCancel(req.id, displayName)}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center h-9 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAccept(req.id, displayName)}
                          disabled={actionLoading !== null}
                          className="flex-1 flex items-center justify-center h-9 rounded-lg bg-blue-500 text-xs font-semibold text-white transition-colors hover:bg-blue-600 shadow-sm shadow-blue-500/10 disabled:opacity-50"
                        >
                          Chấp nhận
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
