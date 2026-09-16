export const queryKeys = {
    all: ['app'] as const,
    feed: () => [...queryKeys.all, 'feed'] as const,
    feedList: () => [...queryKeys.feed()] as const,
    user: (id: string) => [...queryKeys.all, 'user', id] as const,
    post: (id: string) => [...queryKeys.all, 'post', id] as const,
    me: () => [...queryKeys.all, 'me'] as const,
}
