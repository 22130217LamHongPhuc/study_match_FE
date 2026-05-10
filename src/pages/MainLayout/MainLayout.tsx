import { Box } from "@mui/system";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/sidebar/SideBar";
import Header from "../../components/header/Header";
import WebSocketManager from "../../socket/WebSocketManager";
import { ToastContainer, toast } from 'react-toastify';
import ToastCustom from "../../components/toastComponent/ToastCustom";
import { MessageInterface } from "../../model/Conversation";
import { useDispatch, useSelector } from "react-redux";
import { updateNewMess } from "../../redux/ChatReducer";
import { SocketResponse } from "../../model/SocketResponse";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";

interface NewMess {
  conversationId: number,
  message: MessageInterface
}
export default function MainLayout() {
  const [newMessage, setNewMessage] = useState<MessageInterface | null>(null);
  const notify = () => {
    toast(<ToastCustom message={newMessage?.content || ""} userName={newMessage?.senderId.toString() || ""}></ToastCustom>, {
      position: "bottom-right",
      autoClose: 4000,
    })
  };
  const dispatch = useDispatch();
  const currentConverId = useSelector((state: RootState) => state.chat.currentConversationId)
  const currentConverIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    currentConverIdRef.current = currentConverId;
    console.log("Redux currentConverId mới nhất:", currentConverId);
  }, [currentConverId]);
  useLayoutEffect(() => {
    let ws = WebSocketManager.getInstance()
    console.log("đây là userId", localStorage.getItem('userId'))
    ws.connect().then(() => {
      ws.onMessage("/queue/messages/" + localStorage.getItem('userId'), (msg: any) => {
        console.log('nghe nè', msg)
        const parsed: SocketResponse = JSON.parse(msg)
        console.log(parsed, 'parsed nè', currentConverIdRef)
        console.log('curren', currentConverId)

        if (parsed.data?.conversationId === Number(currentConverIdRef.current)) {
          console.log('nhạn đươc', parsed)
          dispatch(updateNewMess(parsed))
        }
        else {
          notify();
        }

      })
    }).catch((err) => {
      console.error("Lỗi connect:", err);
    });
  }, [currentConverId])



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
