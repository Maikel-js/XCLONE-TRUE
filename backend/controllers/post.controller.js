const postService = require('../services/post.service');
const placeService = require('../services/place.service');
const prisma = require('../lib/prismaClient');

async function getPostById(req, res) {
    const postId = req.params.id;

    if (!postId) {
        return res.status(400).json({
            error: 'ID del post no encontrado'
        });
    }

    const post = await postService.getPostById(postId);

    if (!post) {
        return res.status(404).json({
            error: 'Post no encontrado'
        });
    }

    res.status(200).json(post);
}

async function createPost(req, res) {
    const content = typeof req.body.content === 'string' ? req.body.content : '';
    const gifUrl = typeof req.body.gifUrl === 'string' ? req.body.gifUrl : null;
    const placeId = typeof req.body.placeId === 'string' ? req.body.placeId : null;

    if (gifUrl && !isGiphyGifUrl(gifUrl)) {
        return res.status(400).json({ error: 'El GIF seleccionado no es válido' });
    }

    // Location opt-in: solo se puede postear con lugar si el usuario lo activo
    let place = null;
    if (placeId) {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { postLocationEnabled: true }
        });
        if (!user?.postLocationEnabled) {
            return res.status(403).json({ error: 'Debes activar la ubicacion en tus ajustes para etiquetar lugares' });
        }

        place = await placeService.getPlaceById(placeId);
        if (!place) {
            return res.status(400).json({ error: 'El lugar seleccionado no es valido' });
        }
    }

    const postData = {
        content,
        mediaUrl: req.file ? `/uploads/posts/${req.file.filename}` : gifUrl,
        authorId: req.userId
    };

    if (place) {
        postData.placeId = place.id;
    }

    if (!postData.content && !postData.mediaUrl) {
        return res.status(400).json({ error: 'Escribe algo o adjunta un medio para publicar' });
    }

    if (postData.content.length > 500) {
        return res.status(400).json({ error: 'El contenido del post no puede exceder los 500 caracteres' });
    }

    const newPost = await postService.createPost(postData);

    if (!newPost) {
        return res.status(500).json({
            error: 'Error al crear el post'
        });
    }

    res.status(201).json(newPost);
}

function isGiphyGifUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && /^media\d*\.giphy\.com$/i.test(url.hostname);
    } catch {
        return false;
    }
}

async function updatePost(req, res) {
    const postId = req.params.id;

    if (!postId) {
        return res.status(400).json({
            error: 'ID del post no proporcionado'
        });
    }

    const postData = req.body;

    if (!postData || Object.keys(postData).length === 0) {
        return res.status(400).json({
            error: 'Datos del post no proporcionados'
        });
    }

    if (postData.content !== undefined) {
        if (typeof postData.content !== 'string') {
            return res.status(400).json({ error: 'El contenido del post debe ser un texto' });
        }
        if (postData.content.length > 500) {
            return res.status(400).json({ error: 'El contenido del post no puede exceder los 500 caracteres' });
        }
    }

    try {
        const existing = await postService.getPostById(postId);
        if (!existing) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({ error: 'No puedes modificar un post ajeno' });
        }
        const updatedPost = await postService.updatePost(postId, postData);
        res.status(200).json(updatedPost);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Post no encontrado' });
        }
        res.status(500).json({ error: 'Error al actualizar el post' });
    }
}

async function deletePost(req, res) {
    const postId = req.params.id;

    if (!postId) {
        return res.status(400).json({
            error: 'ID del post no proporcionado'
        });
    }

    try {
        const existing = await postService.getPostById(postId);
        if (!existing) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({ error: 'No puedes eliminar un post ajeno' });
        }
        const deletedPost = await postService.deletePost(postId);

        res.status(200).json(deletedPost);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Post no encontrado'
            });
        }

        res.status(500).json({
            error: 'Error al eliminar el post'
        });
    }
}

module.exports = {
    getPostById,
    createPost,
    updatePost,
    deletePost
};
