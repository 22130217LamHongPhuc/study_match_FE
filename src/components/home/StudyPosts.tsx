import React from "react";
import { SocialPost } from "../../services/SocialPostService";
import Post, { PostSkeleton } from "../post/Post";
import noPostImg from "../../assets/img/no-post.png";

interface StudyPostsProps {
  posts: SocialPost[];
  currentUserId: number;
  onAddPost?: () => void;
  onPostChanged: (post: SocialPost) => void;
  onPostDeleted: (postId: number) => void;
  onPostCreated?: (post: SocialPost) => void;
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
  onPostCreated,
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
          <img
            src={noPostImg}
            alt="Chưa có bài đăng"
            className="mx-auto mb-3 h-28 w-auto object-contain mix-blend-multiply"
          />
          <p className="text-sm font-medium text-gray-500">
            Chưa có bài đăng học tập nào. Hãy tạo bài đăng đầu tiên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[calc(100%+2rem)] -mx-4 sm:mx-0 sm:w-full lg:w-[90%] bg-white border-y border-slate-200 sm:border sm:rounded-2xl p-4 sm:p-6 shadow-none sm:shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-gray-800">Bài đăng</h2>
      </div>

      <div className="space-y-4">
        {isPosting && <PostSkeleton />}
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onPostChanged={onPostChanged}
            onPostDeleted={onPostDeleted}
            onPostCreated={onPostCreated}
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
