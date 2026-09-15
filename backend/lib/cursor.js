function encodeCursor({createdAt, id}) {

    const json = JSON.stringify({ createdAt: createdAt.toISOString(), id});
    
    return Buffer.from(json, 'utf-8').toString('base64url');
}

function decodeCursor(cursor) {

    if (!cursor) {
        return null;
    }

    try{const json = Buffer.from(cursor, 'base64url').toString('utf-8');

    const obj = JSON.parse(json);

    if (!obj || typeof obj.id !== 'string' || obj.id.length === 0) {
        throw new Error()
    }

    if (typeof obj.createdAt !== 'string' || Number.isNaN(Date.parse(obj.createdAt))) {
        throw new Error()
    }

    return { createdAt: new Date(obj.createdAt), id: obj.id};
    }catch(_){
        throw new Error('Cursor inválido')
    }
}

module.exports = {
    encodeCursor,
    decodeCursor
};