import { BASE_SOCIAL_SERVICE } from "../config/BaseConfig";

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
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/user/${userId}${query}`);
  if (!res.ok) throw new Error(`Cannot load posts. HTTP ${res.status}`);
  return unwrap(await res.json()) || [];
}

export async function createPost(payload: {
  authorId: number;
  content: string;
  visibility?: string;
  media?: { mediaUrl: string; mediaType: string }[];
}): Promise<SocialPost> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts?viewerId=${payload.authorId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Cannot create post. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function uploadPostMedia(file: File): Promise<{ mediaUrl: string; mediaType: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/media`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Cannot upload post media. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function updatePost(postId: number, payload: {
  actorId: number;
  content: string;
  visibility?: string;
  media?: { mediaUrl: string; mediaType: string }[];
}): Promise<SocialPost> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Cannot update post. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function deletePost(postId: number, actorId: number): Promise<void> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}?actorId=${actorId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Cannot delete post. HTTP ${res.status}`);
}

export async function togglePostLike(postId: number, userId: number, reactionType?: string): Promise<SocialPost> {
  const url = reactionType 
    ? `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/like?userId=${userId}&reactionType=${encodeURIComponent(reactionType)}`
    : `${BASE_SOCIAL_SERVICE}/social/posts/${postId}/like?userId=${userId}`;
  const res = await fetch(url, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Cannot toggle like. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function loadPostComments(postId: number): Promise<PostComment[]> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/comments`);
  if (!res.ok) throw new Error(`Cannot load comments. HTTP ${res.status}`);
  return unwrap(await res.json()) || [];
}

export async function addPostComment(postId: number, authorId: number, content: string): Promise<PostComment> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorId, content }),
  });
  if (!res.ok) throw new Error(`Cannot add comment. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function loadProfileSocialStats(userId: number): Promise<ProfileSocialStats> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/users/${userId}/stats`);
  if (!res.ok) throw new Error(`Cannot load stats. HTTP ${res.status}`);
  return unwrap(await res.json());
}

export async function loadAchievements(userId: number): Promise<Achievement[]> {
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/users/${userId}/achievements`);
  if (!res.ok) throw new Error(`Cannot load achievements. HTTP ${res.status}`);
  return unwrap(await res.json()) || [];
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
  const res = await fetch(
    `${BASE_SOCIAL_SERVICE}/social/posts/feed?page=${page}&size=${size}&viewerId=${viewerId}`,
  );
  if (!res.ok) throw new Error(`Cannot load feed posts. HTTP ${res.status}`);
  return unwrap(await res.json());
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
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot load reactions. HTTP ${res.status}`);
  return unwrap(await res.json()) || [];
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
  const res = await fetch(`${BASE_SOCIAL_SERVICE}/social/posts/${postId}/share${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Cannot share post. HTTP ${res.status}`);
  return unwrap(await res.json());
}
