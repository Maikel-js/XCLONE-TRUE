import { apiFetch } from "./client";
import type {
    AuthResponse,
    CreatePostInput,
    FeedPage,
    LoginInput,
    Post,
    RegisterInput,
    UpdateUserInput,
    User,
    CachedUser
} from '../types'

export const authApi = {
    login: (input: LoginInput) => apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input }),
    register: (input: RegisterInput) => apiFetch<User>('/auth/register', { method: 'POST', body: input }),
    validate: () => apiFetch<User>('/auth/me'),
}

export const userApi = {
    getById: (id: string) => apiFetch<CachedUser>(`/users/${id}`),
    update: (id: string, input: UpdateUserInput) => apiFetch<CachedUser>(`/users/${id}`, { method: 'PATCH', body: input }),
    me: () => apiFetch<CachedUser>('/users/me'),
    search: (q: string) => apiFetch<{ users: User[] }>(`/users/search?q=${encodeURIComponent(q)}`),
    suggestions: (limit = 10) => apiFetch<{ users: User[] }>(`/users/suggestions?limit=${limit}`),
    posts: (id: string, { cursor, limit = 20 }: { cursor?: string; limit?: number } = {}) => {
        const search = new URLSearchParams()
        if (cursor) search.set('cursor', cursor)
        search.set('limit', String(limit))
        return apiFetch<FeedPage>(`/users/${id}/posts?${search.toString()}`)
    },
}

export const postApi = {
    getById: (id: string) => apiFetch<Post>(`/posts/${id}`),
    create: (input: CreatePostInput) => apiFetch<Post>('/posts', { method: 'POST', body: input }),
    delete: (id: string) => apiFetch<Post>(`/posts/${id}`, { method: 'DELETE' })
}

export const likeApi = {
    like: (postId: string) =>
        apiFetch<{ message: string }>('/likes/like', { method: 'POST', body: { postId } }),
    unlike: (postId: string) =>
        apiFetch<{ message: string }>('/likes/unlike', { method: 'POST', body: { postId } }),
}

export const followApi = {
    follow: (followingId: string) => apiFetch<{ message: string }>('/follows/follow', { method: 'POST', body: { followingId } }),
    unfollow: (followingId: string) => apiFetch<{ message: string }>('/follows/unfollow', { method: 'POST', body: { followingId } })
}

export const feedApi = {
    getPage: ({ cursor, limit = 20, mode = 'for-you' }: {cursor?: string; limit?: number; mode?: 'for-you' | 'following'}) => {
        const search = new URLSearchParams()
        if(cursor) search.set('cursor', cursor)
        search.set('limit', String(limit))
        search.set('mode', mode)
        return apiFetch<FeedPage>(`/feeds?${search.toString()}`)
    },
}