import React, { useEffect, useState, useCallback } from "react";
import { Pagination, useTheme, useMediaQuery } from "@mui/material";
import { isApiSuccess } from "../../config/apiClient";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DocumentDetailModal from "./components/DocumentDetailModal";

import HeaderBanner from "./components/HeaderBanner";
import FiltersToolbar, { CATEGORIES } from "./components/FiltersToolbar";
import DocumentCard from "./components/DocumentCard";
import { SkeletonGrid, ErrorState, EmptyState } from "./components/StatesViews";
import UploadDocumentModal from "./components/UploadDocumentModal";

import { getAllSubjects, Subject } from "../../services/GroupService";
import { 
  getDocuments, 
  bookmarkDocument, 
  unbookmarkDocument, 
  getMyBookmarks, 
  DocumentResponse 
} from "../../services/DocumentService";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documentId } = useParams<{ documentId: string }>();

  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const searchVal = searchParams.get("search") || "";
  const subjectIdVal = searchParams.get("subjectId") || "";
  const categoryVal = searchParams.get("category") || "";
  const fileTypeVal = searchParams.get("fileType") || "";
  const sortByVal = searchParams.get("sortBy") || "newest";
  const pageVal = Number(searchParams.get("page") || "1");

  const [searchText, setSearchText] = useState(searchVal);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const loadSubjects = useCallback(async () => {
    try {
      const res = await getAllSubjects();
      if (isApiSuccess(res) && res.data) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    try {
      const res = await getMyBookmarks(0, 100);
      if (isApiSuccess(res) && res.data?.content) {
        const ids = res.data.content.map(doc => doc.id);
        setBookmarkedIds(new Set(ids));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        search: searchVal || undefined,
        subjectId: subjectIdVal || undefined,
        category: categoryVal || undefined,
        fileType: fileTypeVal || undefined,
        sortBy: sortByVal || undefined,
        page: pageVal - 1,
        size: 10
      };
      
      const res = await getDocuments(queryParams);
      
      if (isApiSuccess(res) && res.data) {
        setDocuments(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setDocuments([]);
        setError(res.message || "Không thể tải danh sách tài liệu.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [searchVal, subjectIdVal, categoryVal, fileTypeVal, sortByVal, pageVal]);

  useEffect(() => {
    void loadSubjects();
    void loadBookmarks();
  }, [loadSubjects, loadBookmarks]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (documentId) {
      const id = Number(documentId);
      if (!isNaN(id)) {
        setSelectedDocumentId(id);
      }
    } else {
      setSelectedDocumentId(null);
    }
  }, [documentId]);

  useEffect(() => {
    const handleOpenDetail = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (customEvent.detail) {
        navigate(`/documents/${customEvent.detail}`);
      }
    };
    window.addEventListener("open-document-detail", handleOpenDetail);
    return () => window.removeEventListener("open-document-detail", handleOpenDetail);
  }, [navigate]);

  const handleCloseDetailModal = () => {
    setSelectedDocumentId(null);
    if (documentId) {
      navigate("/documents");
    }
    void loadDocuments();
    void loadBookmarks();
  };

  const handleBookmarkChanged = (docId: number, isBookmarked: boolean) => {
    const nextSet = new Set(bookmarkedIds);
    if (isBookmarked) {
      nextSet.add(docId);
    } else {
      nextSet.delete(docId);
    }
    setBookmarkedIds(nextSet);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("search") || "";
      if (searchText.trim() !== currentQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (searchText.trim()) {
          newParams.set("search", searchText.trim());
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "1");
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, searchParams, setSearchParams]);

  useEffect(() => {
    setSearchText(searchVal);
  }, [searchVal]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(value));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSearchParams(new URLSearchParams());
  };

  const handleToggleSave = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedIds.has(docId);
    
    const nextSet = new Set(bookmarkedIds);
    if (isBookmarked) {
      nextSet.delete(docId);
    } else {
      nextSet.add(docId);
    }
    setBookmarkedIds(nextSet);

    try {
      if (isBookmarked) {
        const res = await unbookmarkDocument(docId);
        if (isApiSuccess(res)) {
          toast.success("Đã hủy lưu tài liệu khỏi thư viện cá nhân");
        } else {
          setBookmarkedIds(new Set(bookmarkedIds));
          toast.error(res.message || "Không thể hủy lưu tài liệu");
        }
      } else {
        const res = await bookmarkDocument(docId);
        if (isApiSuccess(res)) {
          toast.success("Đã lưu tài liệu thành công vào thư viện cá nhân");
        } else {
          setBookmarkedIds(new Set(bookmarkedIds));
          toast.error(res.message || "Không thể lưu tài liệu");
        }
      }
    } catch {
      setBookmarkedIds(new Set(bookmarkedIds));
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find(c => c.value === category);
    return found ? found.label : "Khác";
  };

  const hasFilters = Boolean(searchVal || subjectIdVal || categoryVal || fileTypeVal || sortByVal !== "newest");

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <HeaderBanner 
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onMyLibraryClick={() => navigate("/documents/my-library")} 
        isSmDown={isSmDown} 
      />

      <FiltersToolbar 
        searchValue={searchText}
        onSearchChange={setSearchText}
        subjectId={subjectIdVal} 
        category={categoryVal} 
        fileType={fileTypeVal} 
        sortBy={sortByVal} 
        subjects={subjects} 
        onFilterChange={handleFilterChange} 
        onClearFilters={handleClearFilters}
        hasFilters={hasFilters}
      />

      {loading && <SkeletonGrid />}

      {!loading && error && <ErrorState message={error} onRetry={loadDocuments} />}

      {!loading && !error && documents.length === 0 && (
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
      )}

      {!loading && !error && documents.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const isBookmarked = bookmarkedIds.has(doc.id);
              const subjectObj = subjects.find(s => s.subjectId === doc.subjectId);
              const subjectName = subjectObj ? subjectObj.subjectName : `Môn học #${doc.subjectId}`;
              const categoryLabel = getCategoryLabel(doc.category);
              
              return (
                <DocumentCard 
                  key={doc.id}
                  doc={doc}
                  isBookmarked={isBookmarked}
                  subjectName={subjectName}
                  categoryLabel={categoryLabel}
                  onToggleSave={handleToggleSave}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                count={totalPages}
                page={pageVal}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                    fontWeight: 600,
                  }
                }}
              />
            </div>
          )}
        </>
      )}
      <UploadDocumentModal 
        open={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        subjects={subjects}
        onSuccess={loadDocuments}
      />

      <DocumentDetailModal
        documentId={selectedDocumentId}
        onClose={handleCloseDetailModal}
        onBookmarkChanged={handleBookmarkChanged}
      />
    </div>
  );
}
