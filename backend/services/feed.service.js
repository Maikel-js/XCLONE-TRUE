const prisma = require('../lib/prismaClient')
const { encodeCursor, decodeCursor } = require('../lib/cursor')

async function getUserFeed(userId, { limit, cursor, mode = 'for-you' }) {

    //Id de usuarios seguidos

    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
    })

    const following = follows.map(f => f.followingId)

    //2 Decodificar cursor (si viene) con manejo de error limpio

    let decoded = null

    if (cursor) {
        try {
            decoded = decodeCursor(cursor)
        } catch (_) {
            throw new Error('Cursor inválido')
        }
    }

    //3 Rama OR: según el modo del timeline

    let baseOR
    if (mode === 'following') {
        baseOR = [{ authorId: { in: following } }]
    } else {
        baseOR = [
            { authorId: userId },
            { authorId: { in: following } },
            { likes: { some: { userId } } }
        ]
    }

    // 4 Cursor: mas antiguos que el ultimo item de la pagina anterior

    let where;
    if (decoded) {
        const cursorWhere = {
            OR: [
                { createdAt: { lt: decoded.createdAt } },
                {
                    AND: [
                        { createdAt: decoded.createdAt },
                        { id: { lt: decoded.id } }
                    ]
                }
            ]
        };

        where = { AND: [{ OR: baseOR }, cursorWhere] };
    } else {
        where = { OR: baseOR }
    }

    //5 Traer una fila extra para detectar "hay mas"

    const rows = await prisma.post.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true
                }
            },
            _count: { select: { likes: true } }
        }
    });

    //6 Hay siguiente pagina

    const hasMore = rows.length > limit;

    const page = hasMore ? rows.slice(0, limit) : rows

    //7 likedByMe en una sola query adicional
    let likedSet = new Set();
    if (page.length > 0) {
        const myLikes = await prisma.like.findMany({
            where: {
                userId,
                postId: { in: page.map(p => p.id) }
            },
            select: { postId: true }
        });
        likedSet = new Set(myLikes.map(l => l.postId));
    }

    //8 Map al shape publico acordado

    const items = page.map(p => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
        authorId: p.authorId,
        author: p.author,
        likesCount: p._count.likes,
        likedByMe: likedSet.has(p.id)
    }));

    //9 nextCursor (opaco)
    const nextCursor = hasMore
    ? encodeCursor({
        createdAt: page[page.length -1].createdAt,
        id: page[page.length - 1].id
    })
    : null;

    return { items, nextCursor}
}

module.exports = {
    getUserFeed
}