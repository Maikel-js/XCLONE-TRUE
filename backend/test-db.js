const prisma = require('./lib/prismaClient');

async function testDatabase() {
    try {
        const userCount = await prisma.user.count();

        console.log(`Conexion a PostgreSQL mediante Prisma: Ok`);
        console.log(`Usuarios en la base de datos: ${userCount}`);

    }catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }finally {
        await prisma.$disconnect();
    }
}

testDatabase();