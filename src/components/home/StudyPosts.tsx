import React from "react";
import { Plus, AlertCircle } from "lucide-react";
import { SocialPost } from "../../services/SocialPostService";
import Post, { PostSkeleton } from "../post/Post";

interface StudyPostsProps {
  posts: SocialPost[];
  currentUserId: number;
  onAddPost?: () => void;
  onPostChanged: (post: SocialPost) => void;
  onPostDeleted: (postId: number) => void;
  isPosting?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function StudyPosts({
  posts,
  currentUserId,
  onAddPost,
  onPostChanged,
  onPostDeleted,
  isPosting = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: StudyPostsProps) {
  if (posts.length === 0 && !isPosting && !loadingMore) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Bài đăng</h2>

        </div>

        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AlertCircle size={24} />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">
            Chưa có bài đăng học tập nào. Hãy tạo bài đăng đầu tiên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Bài đăng</h2>

      </div>

      <div className="space-y-1">
        {isPosting && <PostSkeleton />}
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onPostChanged={onPostChanged}
            onPostDeleted={onPostDeleted}
          />
        ))}
        {loadingMore && posts.length === 0 && (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
          </button>
        </div>
      )}
    </div>
  );
}
