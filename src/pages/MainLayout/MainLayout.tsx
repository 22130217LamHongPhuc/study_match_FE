import { Box } from "@mui/system";
import React, { useLayoutEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/sidebar/SideBar";
import Header from "../../components/header/Header";
import WebSocketManager from "../../socket/WebSocketManager";
import { ToastContainer, toast } from 'react-toastify';
import ToastCustom from "../../components/toastComponent/ToastCustom";
import { MessageInterface } from "../../model/Conversation";
export default function MainLayout() {
  const [newMessage, setNewMessage] = useState<MessageInterface | null>(null);
  const notify = () => {
    toast(<ToastCustom message={newMessage?.content || ""} userName={newMessage?.senderId.toString() || ""}></ToastCustom>, {
      position: "bottom-right",
      autoClose: 4000,
    })
  };
  useLayoutEffect(() => {
    let ws = WebSocketManager.getInstance()
    console.log("đây là userId", localStorage.getItem('userId'))

    ws.connect().then(() => {
      ws.onMessage("/queue/messages/" + localStorage.getItem('userId'), (msg: any) => {
        console.log('nghe nè', msg)
        setNewMessage(msg.data)
        notify();
      })
    }).catch((err) => {
      console.error("Lỗi connect:", err);
    });
  }, [])


  return (
    <div>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ flexShrink: 0 }}>
          <SideBar />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Header />
          <Box>

            <ToastContainer />
            <Outlet />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
