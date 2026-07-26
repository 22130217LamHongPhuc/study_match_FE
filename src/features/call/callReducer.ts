import { CallState, initialCallState, CallSession } from "./callTypes";

export type CallAction =
  | { type: "CREATE_START"; peer?: CallState["incoming"] }
  | { type: "OUTGOING"; session: CallSession; peer: CallState["incoming"] }
  | { type: "INCOMING"; session: CallSession; caller: CallState["incoming"] }
  | { type: "CONNECTING"; session: CallSession }
  | { type: "CONNECTED"; session: CallSession }
  | { type: "END"; status?: "ENDED" | "REJECTED" | "CANCELLED" | "EXPIRED"; reason?: string }
  | { type: "FAIL"; error: string }
  | { type: "RESET" };

export function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case "CREATE_START": return {
      ...initialCallState,
      status: "CREATING",
      incoming: action.peer || null,
    };
    case "OUTGOING": return { ...state, status: "OUTGOING_RINGING", session: action.session, incoming: action.peer, error: null };
    case "INCOMING":
      if (state.status !== "IDLE") return state;
      return { ...state, status: "INCOMING_RINGING", session: action.session, incoming: action.caller };
    case "CONNECTING": return { ...state, status: "CONNECTING", session: action.session };
    case "CONNECTED":
      // A group participant joining causes the backend to publish another
      // VIDEO_CALL_ACCEPTED event to users already inside the room. Keep the
      // existing session object so VideoCallRoom is not unmounted/re-created,
      // which would make Zego leave and join the same room again.
      if (
        state.status === "CONNECTED" &&
        state.session?.sessionId === action.session.sessionId
      ) {
        return state;
      }
      return { ...state, status: "CONNECTED", session: action.session };
    case "END": return { ...state, status: action.status || "ENDED", reason: action.reason || null };
    case "FAIL": return { ...state, status: "FAILED", error: action.error };
    case "RESET": return initialCallState;
    default: return state;
  }
}
