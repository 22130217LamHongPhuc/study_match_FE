# Luồng feedback sau khi kết thúc buổi học

Tài liệu này mô tả cách frontend xử lý feedback khi user rời hoặc kết thúc một buổi học online.

## Mục tiêu logic

Feedback chỉ được kiểm tra ngay sau khi user vừa rời phòng học. Khi user mở lại chi tiết buổi học ở lần sau, màn hình chỉ load chi tiết buổi học, không tự động hiển thị form đánh giá nữa.

Server là nguồn quyết định cuối cùng:

- User có được đánh giá hay không.
- Loại feedback cần hiển thị là gì.
- Tổng thời gian tham gia có đủ điều kiện hay không.
- Feedback có được dùng cho model gợi ý hay không.

## Luồng tổng quan

1. User đang ở trong phòng học online.
2. User bấm rời phòng hoặc phòng học kết thúc.
3. Frontend gọi API leave session để server ghi nhận thời gian rời phòng.
4. Frontend đóng phòng học và refresh lại chi tiết buổi học.
5. Frontend gọi API `feedback-eligibility`.
6. Nếu server trả `sessionEnded = true`, frontend mở panel kết quả feedback.
7. Nếu `canSubmitFeedback = true` và có `feedbackType`, user có thể gửi đánh giá.
8. Nếu `canSubmitFeedback = false` hoặc `feedbackType = null`, frontend chỉ hiển thị kết quả là user chưa thể hoặc không cần gửi feedback.
9. Khi user đóng panel, flow kết thúc.
10. Lần sau user mở lại chi tiết buổi học, frontend chỉ load chi tiết buổi học, không tự gọi lại `feedback-eligibility`.

## File chính

- `src/pages/StudySession/StudySessionPage.tsx`: Điều phối luồng vào phòng, rời phòng, kiểm tra feedback sau khi rời phòng.
- `src/pages/StudySession/components/StudySessionRoom.tsx`: Gọi leave session khi user rời phòng học.
- `src/pages/StudySession/components/FeedbackModal.tsx`: Hiển thị form đánh giá hoặc trạng thái không thể đánh giá.
- `src/pages/StudySession/components/SessionDetailModal.tsx`: Chỉ hiển thị chi tiết buổi học, không tự bật form feedback.
- `src/services/StudySessionService.ts`: Chứa API leave session, check eligibility, submit feedback.
- `src/pages/StudySession/types.ts`: Định nghĩa kiểu dữ liệu feedback.

## Điểm quan trọng 1: rời phòng học

Trong `StudySessionRoom.tsx`, khi user rời phòng, component gọi `finishLeave`.

```tsx
const finishLeave = useCallback(async () => {
  if (finishCalledRef.current) return;
  finishCalledRef.current = true;
  await notifyLeave();
  onLeave(joinData.sessionId);
}, [joinData.sessionId, notifyLeave, onLeave]);
```

`notifyLeave` gọi API để server ghi nhận user đã rời phòng.

```tsx
const notifyLeave = useCallback(async () => {
  if (leaveApiCalledRef.current) return;
  if (!Number.isFinite(userId) || userId <= 0) return;

  leaveApiCalledRef.current = true;

  try {
    await leaveStudySession(joinData.sessionId, userId);
  } catch {}
}, [joinData.sessionId, userId]);
```

Ý nghĩa:

- API leave phải chạy trước khi check feedback.
- Server cần biết thời lượng tham gia thực tế để quyết định user có được feedback hay không.
- `leaveApiCalledRef` và `finishCalledRef` tránh gọi trùng khi user rời phòng nhiều cách khác nhau.

## Điểm quan trọng 2: chỉ check feedback sau khi rời phòng

Trong `StudySessionPage.tsx`, `handleLeaveRoom` là nơi duy nhất gọi `getFeedbackEligibility`.

```tsx
const handleLeaveRoom = useCallback(async (sessionId: number) => {
  setJoinedRoom(null);
  setFeedbackEligibility(null);
  const fallback =
    joinedSession ??
    sessions.find((session) => session.id === sessionId) ??
    null;

  if (fallback) {
    setSelectedSession(fallback);
  }

  if (!Number.isFinite(currentUserId) || currentUserId <= 0 || !fallback) {
    setJoinedSession(null);
    return;
  }

  try {
    const response = await getStudySessionById(sessionId, currentUserId);
    const updatedSession = mapSessionToVm(response.data, new Map());

    setSessions((prev) =>
      prev.map((session) =>
        session.id === updatedSession.id ? updatedSession : session,
      ),
    );
    setSelectedSession(updatedSession);
  } catch {}

  try {
    const eligibilityResponse = await getFeedbackEligibility(
      sessionId,
      currentUserId,
    );
    setFeedbackEligibility(eligibilityResponse.data ?? null);
  } catch {
  } finally {
    setJoinedSession(null);
  }
}, [currentUserId, joinedSession, sessions]);
```

Ý nghĩa:

- Khi rời phòng, frontend đóng room bằng `setJoinedRoom(null)`.
- Sau đó refresh chi tiết session bằng `getStudySessionById`.
- Sau đó mới gọi `getFeedbackEligibility`.
- Request refresh session và request eligibility được tách riêng, để lỗi check feedback không làm hỏng việc cập nhật buổi học.
- `feedbackEligibility` là state tạm thời của lần rời phòng hiện tại, không phải state của modal chi tiết.

## Điểm quan trọng 3: render feedback panel

Trong `StudySessionPage.tsx`, panel feedback chỉ render khi state `feedbackEligibility` có dữ liệu và server xác nhận session đã kết thúc.

```tsx
{feedbackEligibility?.sessionEnded && (
  <FeedbackSubmitPanel
    eligibility={feedbackEligibility}
    onClose={() => setFeedbackEligibility(null)}
  />
)}
```

Ý nghĩa:

- Form feedback không phụ thuộc vào `selectedSession`.
- Khi user đóng panel, `feedbackEligibility` bị reset về `null`.
- Sau khi reset, mở lại chi tiết buổi học không làm form bật lại.

## Điểm quan trọng 4: chi tiết buổi học không tự mở feedback

`SessionDetailModal.tsx` không gọi `getFeedbackEligibility`. Component này chỉ có trách nhiệm:

- Load chi tiết buổi học bằng `getStudySessionById`.
- Load thống kê xác nhận nếu user có quyền xem.
- Cho phép xác nhận hoặc từ chối buổi học.
- Cho phép vào phòng học nếu buổi học chưa kết thúc và user đủ trạng thái.

Đây là phần quan trọng để tránh bug cũ: mở lại chi tiết buổi học đã kết thúc không được tự động hiển thị form feedback.

## Điểm quan trọng 5: API check eligibility

Trong `StudySessionService.ts`:

```ts
export async function getFeedbackEligibility(
  sessionId: number,
  userId: number,
): Promise<APIResponseData<FeedbackEligibilityResponse>> {
  const response = await apiFetch<FeedbackEligibilityResponse>(
    `/api/study-sessions/${sessionId}/feedback-eligibility?userId=${userId}`,
    {
      method: "GET",
    },
    API_BASE_URL,
  );

  return response;
}
```

Response được định nghĩa trong `types.ts`:

```ts
export interface FeedbackEligibilityResponse {
  sessionId: number;
  userId: number;
  sessionType: StudySessionType;
  targetUserId: number | null;
  groupId: number | null;
  sessionEnded: boolean;
  canSubmitFeedback: boolean;
  feedbackType: FeedbackType | null;
  totalDurationSeconds: number;
  minRequiredDurationSeconds: number;
  attendanceStatus: AttendanceStatus;
  eligibleForModel: boolean;
}
```

Các field quan trọng:

- `sessionEnded`: Có nên hiển thị kết quả feedback sau khi rời phòng hay không.
- `canSubmitFeedback`: User có được gửi feedback hay không.
- `feedbackType`: Loại feedback cần hiển thị.
- `totalDurationSeconds`: Tổng thời gian user đã tham gia.
- `minRequiredDurationSeconds`: Thời gian tối thiểu để đủ điều kiện.
- `eligibleForModel`: Feedback này có được dùng cho model gợi ý hay không.

## Điểm quan trọng 6: modal feedback xử lý hai trường hợp

Trong `FeedbackModal.tsx`, biến `canSubmit` gom điều kiện được gửi feedback.

```tsx
const type = eligibility.feedbackType;
const isFullFeedback = type === "SESSION_FEEDBACK";
const isPartialFeedback = type === "PARTIAL_FEEDBACK";
const canRate = isFullFeedback || isPartialFeedback;
const canSubmit = eligibility.canSubmitFeedback && !!type;
```

Nếu không được gửi feedback, modal chỉ hiển thị trạng thái.

```tsx
{!canSubmit ? (
  <EmptyState text="Hiện tại bạn chưa thể gửi phản hồi cho buổi học này." />
) : submitted ? (
  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-center">
    ...
  </div>
) : (
  <form onSubmit={handleSubmit} className="space-y-5">
    ...
  </form>
)}
```

Ý nghĩa:

- Server trả không đủ điều kiện thì user vẫn thấy kết quả kiểm tra.
- Frontend không tự đoán user có được đánh giá hay không.
- Nếu `canSubmitFeedback = false`, user không thấy form submit.

## Điểm quan trọng 7: submit feedback

Khi user đủ điều kiện và submit form, `FeedbackModal.tsx` build payload từ response của server.

```tsx
const payload: SubmitStudyFeedbackRequest = {
  sessionId: eligibility.sessionId,
  userId: eligibility.userId,
  targetUserId: eligibility.targetUserId,
  groupId: eligibility.groupId,
  sessionType: eligibility.sessionType,
  feedbackType: type,
  content: feedbackContent,
  eligibleForModel: eligibility.eligibleForModel,
  ...(canRate ? { rating } : {}),
  ...(isFullFeedback
    ? {
        matchedQualityScore,
        communicationScore,
        studyEffectivenessScore,
      }
    : {}),
  ...(isPartialFeedback ? { studyEffectivenessScore } : {}),
};
```

Sau đó gọi API submit:

```tsx
await submitStudyFeedback(payload);
setSubmitted(true);
toast.success("Đã gửi đánh giá buổi học");
```

Service tương ứng:

```ts
export async function submitStudyFeedback(
  payload: SubmitStudyFeedbackRequest,
): Promise<APIResponseData<SubmitStudyFeedbackResponse>> {
  const response = await apiFetch<SubmitStudyFeedbackResponse>(
    "/api/study-feedbacks",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    API_BASE_URL,
  );

  return response;
}
```

## Vì sao không check feedback trong modal chi tiết

Nếu `SessionDetailModal` tự gọi `feedback-eligibility` mỗi lần mở session đã kết thúc, sẽ xảy ra lỗi logic:

1. User kết thúc buổi học.
2. Server cho phép feedback.
3. User có thể chọn đánh giá hoặc không.
4. Flow sau buổi học đã kết thúc.
5. Lần sau user mở lại chi tiết buổi học.
6. Nếu modal chi tiết lại gọi eligibility, form feedback có thể bật lại.

Vì vậy, `feedback-eligibility` chỉ được gọi trong flow rời phòng, không gọi trong flow xem lại chi tiết.

## Quy tắc cần giữ khi sửa tiếp

- Không gọi `getFeedbackEligibility` trong `SessionDetailModal`.
- Không gắn form feedback vào state `selectedSession`.
- Chỉ set `feedbackEligibility` sau hành động rời phòng học.
- Sau khi đóng feedback panel, reset `feedbackEligibility` về `null`.
- Khi server trả `canSubmitFeedback = false`, chỉ hiển thị trạng thái, không render form submit.
- Khi submit feedback, dùng dữ liệu từ `FeedbackEligibilityResponse` để build payload.

