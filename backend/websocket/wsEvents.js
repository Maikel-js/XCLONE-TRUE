const EventEmitter = require('events');
const registry = require('./wsRegistry');
const { envelope } = require('./wsMessages');

const bus = new EventEmitter();

const EVENT_LIKE_CREATED = 'notification.like';
const EVENT_LIKE_REMOVED = 'notification.like.removed';
const EVENT_FOLLOW_CREATED = 'notification.follow';
const EVENT_FOLLOW_REMOVED = 'notification.follow.removed';

const EVENT_USER_REGISTERED = 'user.registered';
const EVENT_USER_LOGGED_IN = 'user.logged_in';
const EVENT_USER_CREATED = 'user.created';
const EVENT_USER_UPDATED = 'user.updated';
const EVENT_USER_DELETED = 'user.deleted';

const EVENT_POST_CREATED = 'post.created';
const EVENT_POST_UPDATED = 'post.updated';
const EVENT_POST_DELETED = 'post.deleted';

function emitLikeNotification({ postAuthorId, likerId, postId }) {
    if (!postAuthorId || postAuthorId === likerId) return 0;
    const message = envelope('post.liked', { postId, likerId });
    bus.emit(EVENT_LIKE_CREATED, { recipientId: postAuthorId, message });
    return registry.sendToUser(postAuthorId, message);
}

function emitUnlikeNotification({ postAuthorId, likerId, postId }) {
    if (!postAuthorId || postAuthorId === likerId) return 0;
    const message = envelope('post.unliked', { postId, likerId });
    bus.emit(EVENT_LIKE_REMOVED, { recipientId: postAuthorId, message });
    return registry.sendToUser(postAuthorId, message);
}

function emitFollowNotification({ followedId, followerId }) {
    if (!followedId || followedId === followerId) return 0;
    const message = envelope('user.followed', { followerId });
    bus.emit(EVENT_FOLLOW_CREATED, { recipientId: followedId, message });
    return registry.sendToUser(followedId, message);
}

function emitUnfollowNotification({ followedId, followerId }) {
    if (!followedId || followedId === followerId) return 0;
    const message = envelope('user.unfollowed', { followerId });
    bus.emit(EVENT_FOLLOW_REMOVED, { recipientId: followedId, message });
    return registry.sendToUser(followedId, message);
}

function emitUserRegistered({ userId, username, displayName }) {
    if (!userId) return 0;
    const message = envelope('user.registered', { userId, username, displayName });
    bus.emit(EVENT_USER_REGISTERED, message);
    return registry.sendToUser(userId, message);
}

function emitUserLoggedIn({ userId, username }) {
    if (!userId) return 0;
    const message = envelope('user.logged_in', { userId, username });
    bus.emit(EVENT_USER_LOGGED_IN, message);
    return registry.sendToUser(userId, message);
}

function emitUserCreated({ userId, username, displayName, bio, avatar }) {
    if (!userId) return 0;
    const message = envelope('user.created', { userId, username, displayName, bio, avatar });
    bus.emit(EVENT_USER_CREATED, message);
    return registry.broadcast(message);
}

function emitUserUpdated({ userId, username, email, displayName, bio, avatar }) {
    if (!userId) return 0;
    const message = envelope('user.updated', { userId, username, email, displayName, bio, avatar });
    bus.emit(EVENT_USER_UPDATED, message);
    return registry.broadcast(message);
}

function emitUserDeleted({ userId }) {
    if (!userId) return 0;
    const message = envelope('user.deleted', { userId });
    bus.emit(EVENT_USER_DELETED, message);
    const sent = registry.broadcast(message);
    registry.closeUser(userId, 4001, 'Cuenta eliminada');
    return sent;
}

function emitPostCreated({ postId, authorId, content, createdAt }) {
    if (!postId) return 0;
    const message = envelope('post.created', { postId, authorId, content, createdAt });
    bus.emit(EVENT_POST_CREATED, message);
    return registry.broadcast(message);
}

function emitPostUpdated({ postId, authorId, content, createdAt }) {
    if (!postId) return 0;
    const message = envelope('post.updated', { postId, authorId, content, createdAt });
    bus.emit(EVENT_POST_UPDATED, message);
    return registry.broadcast(message);
}

function emitPostDeleted({ postId, authorId }) {
    if (!postId) return 0;
    const message = envelope('post.deleted', { postId, authorId });
    bus.emit(EVENT_POST_DELETED, message);
    return registry.broadcast(message);
}

module.exports = {
    bus,
    EVENTS: {
        EVENT_LIKE_CREATED,
        EVENT_LIKE_REMOVED,
        EVENT_FOLLOW_CREATED,
        EVENT_FOLLOW_REMOVED,
        EVENT_USER_REGISTERED,
        EVENT_USER_LOGGED_IN,
        EVENT_USER_CREATED,
        EVENT_USER_UPDATED,
        EVENT_USER_DELETED,
        EVENT_POST_CREATED,
        EVENT_POST_UPDATED,
        EVENT_POST_DELETED
    },
    emitLikeNotification,
    emitUnlikeNotification,
    emitFollowNotification,
    emitUnfollowNotification,
    emitUserRegistered,
    emitUserLoggedIn,
    emitUserCreated,
    emitUserUpdated,
    emitUserDeleted,
    emitPostCreated,
    emitPostUpdated,
    emitPostDeleted
};