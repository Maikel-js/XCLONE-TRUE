export type User = {
    id: string
    username: string
    displayName: string
    email?: string
    bio: string | null
    avatar: string | null
    createdAt: string
}

export type Author = Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>

export type Post = {
    id: string
    content: string
    createdAt: string
    authorId: string
    author: Author
    likesCount: number
    likedByMe: boolean
}

export type FeedPage = {
    items: Post[]
    nextCursor: string | null
}

export type AuthResponse = {
    token: string
}

export type NotificationEvent = | {
    type: 'post.liked'; payload: { postId: string; likerId: string }
} | {
    type: 'post.unliked'; payload: { postId: string; likerId: string }
} | { type: 'post.created'; payload: { postId: string; authorId: string; content: string; createdAt: string } }
    | { type: 'post.deleted'; payload: { postId: string; authorId: string } }
    | { type: 'user.followed'; payload: { followerId: string } }
    | { type: 'user.unfollowed'; payload: { followerId: string } }
    | { type: 'user.updated'; payload: Partial<User> & { id: string } }
    | { type: 'user.deleted'; payload: { userId: string } }
    | { type: 'connection.ready'; payload: { userId: string } }
    | { type: 'error'; payload: { reason: string } }

