# Tài liệu API - Module Thư viện Học liệu & Kiểm duyệt

Tài liệu này mô tả chi tiết toàn bộ các REST API, bao gồm cấu trúc **Request (Đầu vào)** và **Response (Phản hồi)** để Frontend tích hợp một cách chính xác nhất.

---

## I. Cấu trúc phản hồi chung (Envelope Response)
Tất cả các API (trừ API Redirect xem trước/tải file) đều bọc trong một vỏ phản hồi chuẩn:
```json
{
  "success": true,        // Trạng thái thành công (true/false)
  "code": "SUCCESS",      // Mã lỗi hoặc trạng thái (ví dụ: SUCCESS, DOCUMENT_NOT_FOUND, ACCESS_DENIED)
  "message": "...",       // Thông báo mô tả bằng Tiếng Việt
  "data": { ... }         // Dữ liệu thực tế trả về (có thể là Object, Array, hoặc null)
}
```

---

## II. Phân hệ Người dùng (User APIs)

### 1. Đóng góp/Tải lên tài liệu mới
*   **Method:** `POST`
*   **URL:** `/api/documents`
*   **Header:** `Authorization: Bearer <token>`
*   **Request Body (JSON):**
    ```json
    {
      "title": "Tài liệu Toán Cao Cấp A1",
      "description": "Giáo trình ôn tập toán cao cấp đại học bách khoa",
      "subjectId": 12,
      "category": "LECTURE_NOTE", // Thể loại: LECTURE_NOTE, EXAM_PREP, TEXTBOOK, REFERENCE_MATERIAL, OTHER
      "fileUrl": "https://res.cloudinary.com/dx2prhbqh/raw/upload/v1234/toan_a1.pdf",
      "storageKey": "raw/upload/v1234/toan_a1",
      "originalFileName": "toan_a1.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "fileSize": 1048576, // Tính bằng Bytes (Long)
      "sourceName": "Đại học Bách Khoa" // Nguồn (Tùy chọn)
    }
    ```
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": {
        "id": 1,
        "title": "Tài liệu Toán Cao Cấp A1",
        "description": "Giáo trình ôn tập toán cao cấp đại học bách khoa",
        "subjectId": 12,
        "category": "LECTURE_NOTE",
        "fileUrl": "https://res.cloudinary.com/dx2prhbqh/raw/upload/v1234/toan_a1.pdf",
        "storageKey": "raw/upload/v1234/toan_a1",
        "originalFileName": "toan_a1.pdf",
        "fileType": "pdf",
        "mimeType": "application/pdf",
        "fileSize": 1048576,
        "uploaderId": 12, // Tự động nhận diện từ X-User-Id
        "sourceName": "Đại học Bách Khoa",
        "status": "PENDING", // Mặc định ở trạng thái chờ duyệt
        "rejectionReason": null,
        "viewCount": 0,
        "downloadCount": 0,
        "averageRating": 0.0,
        "ratingCount": 0,
        "createdAt": "2026-07-24T10:00:00",
        "updatedAt": "2026-07-24T10:00:00",
        "publishedAt": null
      }
    }
    ```

---

### 2. Danh sách tài liệu công khai (Tìm kiếm & Bộ lọc)
*   **Method:** `GET`
*   **URL:** `/api/documents`
*   **Query Parameters (Tùy chọn):**
    *   `search` (String): Từ khóa tìm kiếm theo tiêu đề/mô tả.
    *   `subjectId` (Long): Bộ lọc theo môn học.
    *   `category` (String): Lọc thể loại (`LECTURE_NOTE`, `EXAM_PREP`...).
    *   `fileType` (String): Lọc đuôi file (`pdf`, `docx`, `pptx`...).
    *   `minRating` (Double): Lọc điểm đánh giá tối thiểu (ví dụ: `4.0` sao trở lên).
    *   `sortBy` (String): `newest` (mới nhất), `downloads` (tải nhiều), `views` (xem nhiều), `ratings` (đánh giá cao).
    *   `page` (Int): Số trang (mặc định `0`).
    *   `size` (Int): Số lượng phần tử mỗi trang (mặc định `10`).
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": {
        "content": [
          {
            "id": 5,
            "title": "Đề thi thử THPT Quốc gia Toán 2026",
            "description": "Đề thi thử bám sát cấu trúc đề thi chính thức.",
            "subjectId": 12,
            "category": "EXAM_PREP",
            "fileType": "pdf",
            "fileSize": 524288,
            "uploaderId": 15,
            "sourceName": "Sở GD&ĐT",
            "viewCount": 230,
            "downloadCount": 150,
            "averageRating": 4.8,
            "ratingCount": 12,
            "createdAt": "2026-07-24T08:00:00"
          }
        ],
        "page": 0,
        "limit": 10,
        "totalElements": 1,
        "totalPages": 1,
        "hasNext": false
      }
    }
    ```

---

### 3. Chi tiết tài liệu
*   **Method:** `GET`
*   **URL:** `/api/documents/{documentId}`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": {
        "id": 5,
        "title": "Đề thi thử THPT Quốc gia Toán 2026",
        "description": "Đề thi thử bám sát cấu trúc đề thi chính thức.",
        "subjectId": 12,
        "category": "EXAM_PREP",
        "fileUrl": "https://res.cloudinary.com/dx2prhbqh/raw/upload/v1234/de_thi_toan.pdf",
        "storageKey": "raw/upload/v1234/de_thi_toan",
        "originalFileName": "de_thi_toan.pdf",
        "fileType": "pdf",
        "mimeType": "application/pdf",
        "fileSize": 524288,
        "uploaderId": 15,
        "sourceName": "Sở GD&ĐT",
        "status": "PUBLISHED",
        "rejectionReason": null,
        "viewCount": 231, // viewCount tự động tăng lên 1
        "downloadCount": 150,
        "averageRating": 4.8,
        "ratingCount": 12,
        "createdAt": "2026-07-24T08:00:00",
        "updatedAt": "2026-07-24T08:30:00",
        "publishedAt": "2026-07-24T08:30:00"
      }
    }
    ```

---

### 4. Lấy danh sách tài liệu nổi bật (Featured)
*   **Method:** `GET`
*   **URL:** `/api/documents/featured`
*   **Query Parameters:**
    *   `limit` (Int): Số lượng lấy ra (mặc định `10`).
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": [
        {
          "id": 5,
          "title": "Đề thi thử THPT Quốc gia Toán 2026",
          "description": "Đề thi thử bám sát cấu trúc đề thi chính thức.",
          "subjectId": 12,
          "category": "EXAM_PREP",
          "fileType": "pdf",
          "fileSize": 524288,
          "uploaderId": 15,
          "sourceName": "Sở GD&ĐT",
          "viewCount": 230,
          "downloadCount": 150,
          "averageRating": 4.8,
          "ratingCount": 12,
          "createdAt": "2026-07-24T08:00:00"
        }
      ]
    }
    ```

---

### 5. Xem trước & Tải tài liệu
*   **Xem trước:** `GET /api/documents/{documentId}/preview` (Tự động tăng `viewCount` lên 1)
*   **Tải file:** `GET /api/documents/{documentId}/download` (Tự động tăng `downloadCount` lên 1)
*   **Cách thức trả về:**
    *   API không trả về JSON mà trả về **mã chuyển hướng HTTP `302 Found`** với Header `Location: <Link_File_Gốc>`.
    *   FE chỉ cần dùng `<a href="/api/documents/5/download" target="_blank">Tải xuống</a>` hoặc `window.open(...)`. Trình duyệt sẽ tự động chuyển hướng và xử lý tải/mở file.

---

### 6. Quản lý tài liệu đã lưu (Bookmarks)

#### **Lưu tài liệu vào thư viện cá nhân:**
*   **Method:** `POST`
*   **URL:** `/api/documents/{documentId}/bookmark`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Lưu tài liệu thành công",
      "data": "Lưu tài liệu thành công"
    }
    ```

#### **Hủy lưu tài liệu:**
*   **Method:** `DELETE`
*   **URL:** `/api/documents/{documentId}/bookmark`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Hủy lưu tài liệu thành công",
      "data": "Hủy lưu tài liệu thành công"
    }
    ```

#### **Kiểm tra trạng thái đã lưu:**
*   **Method:** `GET`
*   **URL:** `/api/documents/{documentId}/bookmark-status`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": true // true nếu đã lưu, false nếu chưa lưu
    }
    ```

#### **Danh sách thư viện đã lưu của tôi:**
*   **Method:** `GET`
*   **URL:** `/api/documents/me/bookmarks`
*   **Query Parameters:**
    *   `page` (Int): Mặc định `0`.
    *   `size` (Int): Mặc định `10`.
*   **Response (JSON):** Trả về danh sách tài liệu tóm tắt (`DocumentSummaryResponse`) đã lưu, sắp xếp theo thời gian lưu mới nhất.

---

### 7. Đánh giá tài liệu (Ratings)

#### **Đánh giá hoặc cập nhật đánh giá:**
*   **Method:** `PUT`
*   **URL:** `/api/documents/{documentId}/rating`
*   **Request Body (JSON):**
    ```json
    {
      "score": 5, // Bắt buộc từ 1 đến 5 (Integer)
      "review": "Nội dung rất dễ hiểu!" // Nhận xét tùy chọn (String)
    }
    ```
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": {
        "id": 1,
        "documentId": 5,
        "userId": 12,
        "score": 5,
        "review": "Nội dung rất dễ hiểu!",
        "createdAt": "2026-07-24T11:00:00",
        "updatedAt": "2026-07-24T11:00:00"
      }
    }
    ```

#### **Xóa đánh giá:**
*   **Method:** `DELETE`
*   **URL:** `/api/documents/{documentId}/rating`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Xóa đánh giá thành công",
      "data": "Xóa đánh giá thành công"
    }
    ```

#### **Lấy đánh giá hiện tại của tôi trên tài liệu:**
*   **Method:** `GET`
*   **URL:** `/api/documents/{documentId}/rating/me`
*   **Response (JSON):** Trả về thông tin đánh giá giống DTO phản hồi ở trên. Nếu chưa đánh giá sẽ trả về lỗi `DOCUMENT_RATING_NOT_FOUND` kèm mã HTTP `400`/`404`.

---

### 8. Báo cáo tài liệu vi phạm
*   **Method:** `POST`
*   **URL:** `/api/documents/{documentId}/reports`
*   **Request Body (JSON):**
    ```json
    {
      "reason": "COPYRIGHT", // Các lý do: COPYRIGHT, INAPPROPRIATE_CONTENT, INCORRECT_SUBJECT, MALWARE_OR_UNSAFE, DUPLICATE, SPAM, OTHER
      "description": "Lý do cụ thể..."
    }
    ```
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Gửi báo cáo thành công",
      "data": "Gửi báo cáo thành công"
    }
    ```

---

## III. Phân hệ Quản trị (Admin APIs)
Yêu cầu: Người dùng phải có quyền `admin` hoặc `super_admin` trong Token.

### 1. Danh sách tìm kiếm & kiểm duyệt của Admin
*   **Method:** `GET`
*   **URL:** `/api/admin/documents`
*   **Query Parameters (Tùy chọn):**
    *   `search` (String): Tìm theo tiêu đề/mô tả.
    *   `status` (String): Lọc theo `PENDING`, `PUBLISHED`, `REJECTED`, `HIDDEN`.
    *   `subjectId` (Long): Theo môn học.
    *   `category` (String): Theo thể loại.
    *   `uploaderId` (Long): Theo người đăng.
    *   `startDate` / `endDate` (String): Khoảng thời gian tạo tài liệu (Định dạng: `yyyy-MM-dd'T'HH:mm:ss`, ví dụ: `2026-07-01T00:00:00`).
    *   `sortBy` (String): `newest`, `views`, `downloads`, `ratings`.
    *   `page` / `size` (Int): Phân trang.
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Thành công",
      "data": {
        "content": [
          {
            "id": 5,
            "title": "Đề thi thử THPT Quốc gia Toán 2026",
            "description": "Đề thi thử bám sát cấu trúc đề thi chính thức.",
            "subjectId": 12,
            "category": "EXAM_PREP",
            "fileUrl": "https://res.cloudinary.com/dx2prhbqh/raw/upload/v1234/de_thi_toan.pdf",
            "storageKey": "raw/upload/v1234/de_thi_toan",
            "originalFileName": "de_thi_toan.pdf",
            "fileType": "pdf",
            "mimeType": "application/pdf",
            "fileSize": 524288,
            "uploaderId": 15,
            "sourceName": "Sở GD&ĐT",
            "status": "PUBLISHED",
            "rejectionReason": null,
            "hiddenReason": null,
            "viewCount": 230,
            "downloadCount": 150,
            "averageRating": 4.8,
            "ratingCount": 12,
            "createdAt": "2026-07-24T08:00:00",
            "updatedAt": "2026-07-24T08:30:00",
            "publishedAt": "2026-07-24T08:30:00",
            "reviewerId": 99,
            "reviewedAt": "2026-07-24T08:30:00",
            "unresolvedReportCount": 3 // Đếm tổng số báo cáo PENDING (chờ duyệt) của tài liệu này từ user_service. Đối với status=PENDING, giá trị luôn trả về 0.
          }
        ],
        "page": 0,
        "limit": 10,
        "totalElements": 1,
        "totalPages": 1,
        "hasNext": false
      }
    }
    ```

---

### 2. Xem chi tiết tài liệu (Phía Admin)
*   **Method:** `GET`
*   **URL:** `/api/admin/documents/{documentId}`
*   **Response (JSON):** Cấu trúc tương tự như phần tử trong danh sách Admin ở trên, trả về đầy đủ chi tiết tài liệu kèm số lượng báo cáo vi phạm chưa xử lý.

---

### 3. Duyệt tài liệu (PENDING -> PUBLISHED)
*   **Method:** `PATCH`
*   **URL:** `/api/admin/documents/{documentId}/approve`
*   **Response (JSON):** Trả về chi tiết tài liệu sau khi được duyệt thành công (status chuyển thành `PUBLISHED`).

---

### 4. Từ chối duyệt tài liệu (PENDING -> REJECTED)
*   **Method:** `PATCH`
*   **URL:** `/api/admin/documents/{documentId}/reject`
*   **Request Body (JSON):**
    ```json
    {
      "rejectionReason": "Tài liệu vi phạm điều khoản đăng tải hoặc nội dung bị mờ."
    }
    ```
*   **Response (JSON):** Trả về chi tiết tài liệu sau khi từ chối thành công (status chuyển thành `REJECTED`).

---

### 5. Ẩn tài liệu (PUBLISHED -> HIDDEN)
*   **Method:** `PATCH`
*   **URL:** `/api/admin/documents/{documentId}/hide`
*   **Request Body (JSON):**
    ```json
    {
      "hiddenReason": "Tài liệu chứa bản quyền chưa được cho phép."
    }
    ```
*   **Response (JSON):** Trả về chi tiết tài liệu sau khi ẩn thành công (status chuyển thành `HIDDEN`).

---

### 6. Khôi phục tài liệu bị ẩn (HIDDEN -> PUBLISHED)
*   **Method:** `PATCH`
*   **URL:** `/api/admin/documents/{documentId}/restore`
*   **Response (JSON):** Trả về chi tiết tài liệu sau khi khôi phục thành công (status trở lại `PUBLISHED`).

---

## IV. API Cấu hình Báo cáo vi phạm (Từ User Service)

Các API này hỗ trợ FE vẽ giao diện báo cáo vi phạm linh hoạt.

### 1. Lấy danh sách Loại đối tượng báo cáo
*   **Method:** `GET`
*   **URL:** `/api/reports/target-types`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Lấy danh sách loại đối tượng báo cáo thành công",
      "data": [
        { "value": "USER", "title": "Người dùng" },
        { "value": "POST", "title": "Bài viết" },
        { "value": "GROUP", "title": "Nhóm học" },
        { "value": "DOCUMENT", "title": "Tài liệu học tập" }
      ]
    }
    ```

### 2. Lấy danh sách Lý do báo cáo vi phạm
*   **Method:** `GET`
*   **URL:** `/api/reports/reasons`
*   **Response (JSON):**
    ```json
    {
      "success": true,
      "code": "SUCCESS",
      "message": "Lấy danh sách lý do báo cáo thành công",
      "data": [
        { "value": "SPAM", "title": "Spam / Quảng cáo" },
        { "value": "HARASSMENT", "title": "Quấy rối / Đe dọa" },
        { "value": "INAPPROPRIATE_CONTENT", "title": "Nội dung không phù hợp" },
        { "value": "FAKE_INFORMATION", "title": "Thông tin giả mạo" },
        { "value": "SCAM", "title": "Lừa đảo" },
        { "value": "CHEATING", "title": "Gian lận" },
        { "value": "COPYRIGHT", "title": "Vi phạm bản quyền" },
        { "value": "INCORRECT_SUBJECT", "title": "Sai môn học" },
        { "value": "MALWARE_OR_UNSAFE", "title": "Mã độc hoặc không an toàn" },
        { "value": "DUPLICATE", "title": "Trùng lặp" },
        { "value": "OTHER", "title": "Khác" }
      ]
    }
    ```

---

## V. TypeScript Type Definitions & Enums (Dành cho FE)

Dưới đây là các định nghĩa Type và Enum bằng TypeScript để FE có thể copy và paste trực tiếp vào dự án (ví dụ file `src/types/document.ts`):

```typescript
export enum DocumentStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN'
}

export enum DocumentCategory {
  LECTURE_NOTE = 'LECTURE_NOTE',
  EXAM_PREP = 'EXAM_PREP',
  TEXTBOOK = 'TEXTBOOK',
  REFERENCE_MATERIAL = 'REFERENCE_MATERIAL',
  OTHER = 'OTHER'
}

export enum DocumentReportReason {
  COPYRIGHT = 'COPYRIGHT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  INCORRECT_SUBJECT = 'INCORRECT_SUBJECT',
  MALWARE_OR_UNSAFE = 'MALWARE_OR_UNSAFE',
  DUPLICATE = 'DUPLICATE',
  SPAM = 'SPAM',
  OTHER = 'OTHER'
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface CreateLearningDocumentRequest {
  title: string;
  description?: string;
  subjectId: number;
  category: DocumentCategory;
  fileUrl: string;
  storageKey?: string;
  originalFileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  sourceName?: string;
}

export interface LearningDocumentResponse {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  category: DocumentCategory;
  fileUrl: string;
  storageKey?: string;
  originalFileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploaderId: number;
  sourceName?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DocumentSummaryResponse {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  category: DocumentCategory;
  fileType: string;
  fileSize: number;
  uploaderId: number;
  sourceName?: string;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

export interface AdminDocumentResponse extends LearningDocumentResponse {
  hiddenReason?: string;
  reviewerId?: number;
  reviewedAt?: string;
  unresolvedReportCount: number;
}

export interface DocumentRatingRequest {
  score: number;
  review?: string;
}

export interface DocumentRatingResponse {
  id: number;
  documentId: number;
  userId: number;
  score: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentReportRequest {
  reason: DocumentReportReason;
  description?: string;
}

export interface ReportOptionResponse {
  value: string;
  title: string;
}
```