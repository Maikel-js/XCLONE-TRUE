const postService = require('../services/post.service');

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
    const postData = {
        content: req.body.content,
        authorId: req.userId
    };

    if (!postData.content) {
        return res.status(400).json({ error: 'El contenido del post es requerido' });
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