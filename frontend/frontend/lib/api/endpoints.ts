import { apiFetch } from "./client";
import type {
    AuthResponse,
    CreatePostInput,
    FeedPage,
    FollowResult,
    LikeResult,
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
}

export const userApi = {
    getById: (id: string) => apiFetch<CachedUser>(`/users/${id}`),
    update: (id: string, input: UpdateUserInput) => apiFetch<CachedUser>(`/users/${id}`, { method: 'PATCH', body: input }),
    me: () => apiFetch<CachedUser>('/users/me')
}

export const postApi = {
    getById: (id: string) => apiFetch<Post>(`/posts/${id}`),
    create: (input: CreatePostInput) => apiFetch<Post>('/posts', { method: 'POST', body: input }),
    delete: (id: string) => apiFetch<Post>(`/posts/${id}`, { method: 'DELETE' })
}

export const likeApi = {
    like: (postId: string) =>
        apiFetch<LikeResult>('/likes/like', { method: 'POST', body: { postId } }),
    unlike: (postId: string) =>
        apiFetch<LikeResult>('/likes/unlike', { method: 'POST', body: { postId } }),
}

export const followApi = {
    follow: (userId: string) => apiFetch<FollowResult>('/follows/follow', { method: 'POST', body: { userId } }),
    unfollow: (userId: string) => apiFetch<FollowResult>('/follows/unfollow', { method: 'POST', body: { userId } })
}

export const feedApi = {
    getPage: ({ cursor, limit = 20 }: {cursor?: string; limit?: number}) => {
        const search = new URLSearchParams()
        if(cursor) search.set('cursor', cursor)
            search.set('limit', String(limit))
        return apiFetch<FeedPage>(`/feeds?${search.toString()}`)
    },
}