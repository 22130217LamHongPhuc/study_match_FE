# Study Session Leave & Feedback Flow

Tài liệu này mô tả các thay đổi FE cho luồng user rời phòng học/video call và kiểm tra quyền hiển thị feedback sau khi session kết thúc.

## Mục tiêu

- Khi user rời phòng học, FE gọi API leave để BE đóng attendance log đang mở.
- Trường hợp user rời bất thường như F5, tắt tab, tắt app, unmount phòng học, FE vẫn cố gắng gửi leave request.
- Sau khi rời phòng, FE quay lại màn chi tiết lịch học.
- FE chỉ gọi API feedback eligibility khi session đã kết thúc.
- FE hiển thị form phù hợp theo `feedbackType` BE trả về.

## API sử dụng

### Leave session

```http
POST /api/study-sessions/{sessionId}/leave
```

Request:

```json
{
  "userId": 57
}
```

Response chính:

```json
{
  "success": true,
  "message": "Rời buổi học thành công",
  "data": {
    "sessionId": 10,
    "userId": 57,
    "leaveTime": "2026-06-07T19:45:00",
    "durationSeconds": 2400,
    "totalDurationSeconds": 2400,
    "attendanceStatus": "PARTIAL"
  }
}
```

### Feedback eligibility

```http
GET /api/study-sessions/{sessionId}/feedback-eligibility?userId=57
```

Response chính:

```json
{
  "success": true,
  "message": "Bạn có thể đánh giá buổi học",
  "data": {
    "sessionId": 10,
    "userId": 57,
    "sessionType": "USER_PAIR",
    "targetUserId": 58,
    "groupId": null,
    "sessionEnded": true,
    "canSubmitFeedback": true,
    "feedbackType": "SESSION_FEEDBACK",
    "totalDurationSeconds": 3000,
    "minRequiredDurationSeconds": 2520,
    "attendanceStatus": "COMPLETED",
    "eligibleForModel": true
  }
}
```

## File đã thay đổi

- `src/services/StudySessionService.ts`
  - Thêm `leaveStudySession`.
  - Thêm `leaveStudySessionOnUnload`.
  - Thêm `getFeedbackEligibility`.

- `src/pages/StudySession/types.ts`
  - Thêm type cho `LeaveStudySessionResponse`.
  - Thêm type cho `FeedbackEligibilityResponse`.
  - Thêm `FeedbackType`.
  - Mở rộng trạng thái attendance/participant liên quan.

- `src/pages/StudySession/components/StudySessionRoom.tsx`
  - Gọi leave API khi user rời phòng.
  - Chống gọi leave trùng bằng `leaveApiCalledRef`.
  - Bắt các trường hợp rời phòng qua nút rời, callback Zego, unmount, F5/tắt tab.

- `src/pages/StudySession/StudySessionPage.tsx`
  - Lưu lại session đang join.
  - Sau khi rời phòng, đóng room overlay và mở lại modal chi tiết lịch học.
  - Refr khỏi màn hình.
4. `StudySessionRoom` gọi API leave một lần duy nhất.
5. BE đóng attendance log đang mở.
6. BE tính `durationSeconds`, cộng vào `totalDurationSeconds`, cập nhật `attendanceStatus`.
7. FE đóng overlay phòng học.
8. FE quay lại modal chi tiết lịch học.
9. FE refresh detail session để lấy trạng thái mới nhất.

## Xử lý các case rời bất thường

### F5 hoặc tắt tab

FE lắng nghe sự kiện `pagehide`.

Khi event xảy ra:

- Nếu chưa gọi leave trước đó, FE gọi `leaveStudySessionOnUnload`.
- Request dùng `fetch` với `keepalive: true`.
- Nếu fetch lỗi đồng bộ, FE fallback sang `navigator.sendBeacon`.

### Unmount room

Khi component `StudySessionRoom` bị unmount:
esh lại detail session sau khi leave.

- `src/pages/StudySession/components/SessionDetailModal.tsx`
  - Chỉ gọi feedback eligibility khi session đã kết thúc.
  - Hiển thị form theo `feedbackType`.

## Flow rời phòng

1. User tham gia phòng học online từ modal chi tiết lịch học.
2. FE gọi API join session và mở `StudySessionRoom`.
3. User rời phòng theo một trong các cách:
   - Bấm nút `Rời phòng` của FE.
   - Bấm leave trong UI của Zego.
   - F5 hoặc tắt tab.
   - App bị unmount
- FE clear timer init Zego.
- Nếu Zego vẫn còn active, FE gọi leave.
- FE destroy Zego instance an toàn bằng `safeDestroyZego`.

### Chống gọi trùng

`StudySessionRoom` dùng `leaveApiCalledRef`.

Mỗi phiên room chỉ cho phép một request leave được gửi từ FE. Điều này tránh việc user bấm nút rời, Zego callback, và unmount cùng lúc làm bắn nhiều request.

## Flow check feedback eligibility

1. User rời phòng và FE quay lại modal chi tiết lịch học.
2. FE refresh detail session.
3. `SessionDetailModal` kiểm tra session đã kết thúc chưa.
4. FE chỉ gọi `feedback-eligibility` nếu:
   - `status === "COMPLETED"`, hoặc
   - `endTime <= thời gian hiện tại`.
5. Nếu session chưa kết thúc, FE không gọi API này và không hiển thị form feedback.
6. Nếu API trả `feedbackType`, FE render form tương ứng.
7. Nếu `feedbackType` là `null`, FE không hiển thị form.

## Mapping feedbackType

### `SESSION_FEEDBACK`

Hiển thị form đánh giá đầy đủ.

Ý nghĩa:

- User tham gia đủ thời lượng.
- `eligibleForModel = true` thì dữ liệu feedback có thể dùng cho AI model.

### `REPORT_PROBLEM`

Hiển thị form báo sự cố.

Ý nghĩa:

- User không tham gia buổi học.
- Feedback dùng để ghi nhận vấn đề thay vì đánh giá chất lượng học.

### `EARLY_LEAVE_REASON`

Hiển thị form lý do rời sớm.

Ý nghĩa:

- User có vào học nhưng rời quá sớm.
- FE cần thu lý do như mất mạng, lỗi kỹ thuật, có việc đột xuất.

### `PARTIAL_FEEDBACK`

Hiển thị form phản hồi ngắn.

Ý nghĩa:

- User học một phần nhưng chưa đủ chuẩn đánh giá đầy đủ.

### `null`

Không hiển thị form.

Ý nghĩa:

- Session chưa kết thúc hoặc BE không cho phép feedback ở thời điểm hiện tại.

## Điều kiện hiển thị feedback

FE không tự quyết định user có được feedback hay không. FE chỉ quyết định có gọi API eligibility hay chưa dựa trên trạng thái kết thúc session.

Quyền feedback cuối cùng phụ thuộc vào BE qua các field:

- `sessionEnded`
- `canSubmitFeedback`
- `feedbackType`
- `attendanceStatus`
- `totalDurationSeconds`
- `minRequiredDurationSeconds`
- `eligibleForModel`

## Verification

Đã kiểm tra:

```bash
npx tsc --noEmit
npm run build
```

Kết quả:

- TypeScript pass.
- Production build pass.
- Build còn warning cũ trong repo, không liên quan đến flow leave/feedback.
