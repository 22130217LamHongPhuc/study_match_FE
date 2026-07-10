import { BASE_SOCIAL_SERVICE } from "../config/BaseConfig";
import { apiFetch } from "../config/apiClient";

const unwrap = (payload: any) => payload?.data ?? payload?.result ?? payload;

export type PostMedia = {
  id?: number;
  mediaUrl: string;
  mediaType: string;
};

export type SocialPost = {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  content?: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  media: PostMedia[];
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  reactionType?: string | null;
  topReactions?: string[] | null;
  sharedPost?: SocialPost | null;
};

export type PostComment = {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
};

export type ProfileSocialStats = {
  postCount: number;
  likeCount: number;
  commentCount: number;
  friendCount: number;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  achieved: boolean;
  progress: number;
  target: number;
};

export async function loadProfilePosts(userId: number, viewerId?: number): Promise<SocialPost[]> {
  const query = viewerId ? `?viewerId=${viewerId}` : "";
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/user/${userId}${query}`);
  if (!res.success) throw new Error(`Cannot load posts. ${res.message}`);
  return unwrap(res.data) || [];
}

export async function createPost(payload: {
  authorId: number;
  content: string;
  visibility?: string;
  media?: { mediaUrl: string; mediaType: string }[];
}): Promise<SocialPost> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts?viewerId=${payload.authorId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success) throw new Error(`Cannot create post. ${res.message}`);
  return unwrap(res.data);
}

export async function uploadPostMedia(file: File): Promise<{ mediaUrl: string; mediaType: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/media`, {
    method: "POST",
    body: formData as any,
  });
  if (!res.success) throw new Error(`Cannot upload post media. ${res.message}`);
  return unwrap(res.data);
}

export async function updatePost(postId: number, payload: {
  actorId: number;
  content: string;
  visibility?: string;
  media?: { mediaUrl: string; mediaType: string }[];
}): Promise<SocialPost> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.success) throw new Error(`Cannot update post. ${res.message}`);
  return unwrap(res.data);
}

export async function deletePost(postId: number, actorId: number): Promise<void> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}?actorId=${actorId}`, {
    method: "DELETE",
  });
  if (!res.success) throw new Error(`Cannot delete post. ${res.message}`);
}

export async function togglePostLike(postId: number, userId: number, reactionType?: string): Promise<SocialPost> {
  const url = reactionType 
    ? `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/like?userId=${userId}&reactionType=${encodeURIComponent(reactionType)}`
    : `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/like?userId=${userId}`;
  const res = await apiFetch<any>(url, {
    method: "POST",
  });
  if (!res.success) throw new Error(`Cannot toggle like. ${res.message}`);
  return unwrap(res.data);
}

export async function loadPostComments(postId: number): Promise<PostComment[]> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/comments`);
  if (!res.success) throw new Error(`Cannot load comments. ${res.message}`);
  return unwrap(res.data) || [];
}

export async function addPostComment(postId: number, authorId: number, content: string): Promise<PostComment> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ authorId, content }),
  });
  if (!res.success) throw new Error(`Cannot add comment. ${res.message}`);
  return unwrap(res.data);
}

export async function loadProfileSocialStats(userId: number): Promise<ProfileSocialStats> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/users/${userId}/stats`);
  if (!res.success) throw new Error(`Cannot load stats. ${res.message}`);
  return unwrap(res.data);
}

export async function loadAchievements(userId: number): Promise<Achievement[]> {
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/users/${userId}/achievements`);
  if (!res.success) throw new Error(`Cannot load achievements. ${res.message}`);
  return unwrap(res.data) || [];
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SocialFeedPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export async function loadFeedPosts(
  page: number,
  size: number,
  viewerId: number,
): Promise<SocialFeedPageResponse<SocialPost>> {
  const res = await apiFetch<any>(
    `${BASE_SOCIAL_SERVICE}/social/posts/feed?page=${page}&size=${size}&viewerId=${viewerId}`,
  );
  if (!res.success) throw new Error(`Cannot load feed posts. ${res.message}`);
  return unwrap(res.data);
}

export type PostReactionUser = {
  userId: number;
  fullName: string;
  avatarUrl?: string | null;
  reactionType: string;
  isFriend: boolean;
  mutualFriends: number;
};

export async function loadPostReactions(postId: number, viewerId?: number): Promise<PostReactionUser[]> {
  const url = viewerId 
    ? `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/reactions?viewerId=${viewerId}`
    : `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/reactions`;
  const res = await apiFetch<any>(url);
  if (!res.success) throw new Error(`Cannot load reactions. ${res.message}`);
  return unwrap(res.data) || [];
}

export async function sharePost(
  postId: number,
  payload: {
    authorId: number;
    content?: string;
    visibility?: string;
  },
  viewerId?: number,
): Promise<SocialPost> {
  const query = viewerId ? `?viewerId=${viewerId}` : "";
  const res = await apiFetch<any>(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/share${query}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.success) throw new Error(`Cannot share post. ${res.message}`);
  return unwrap(res.data);
}
