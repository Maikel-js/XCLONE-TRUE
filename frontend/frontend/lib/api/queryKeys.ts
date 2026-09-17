export const queryKeys = {
    all: ['app'] as const,
    feed: (mode: 'for-you' | 'following' = 'for-you') => [...queryKeys.all, 'feed', mode] as const,
    feedList: () => [...queryKeys.all, 'feed'] as const,
    user: (id: string) => [...queryKeys.all, 'user', id] as const,
    userPosts: (id: string) => [...queryKeys.all, 'user', id, 'posts'] as const,
    post: (id: string) => [...queryKeys.all, 'post', id] as const,
    me: () => [...queryKeys.all, 'me'] as const,
    search: (q: string) => [...queryKeys.all, 'search', q] as const,
    suggestions: () => [...queryKeys.all, 'suggestions'] as const,
}
