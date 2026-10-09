const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function castVote({pollId, pollOptionId, userId}) {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
    });

    const option = await prisma.pollOption.findUnique({
        where: { id: pollOptionId },
    });

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    const expiresAt = poll.expiresAt;
    const now = new Date();

    if (expiresAt && now > expiresAt) {
        throw new Error('Poll has expired');
    }

    if (!poll || !option || !user) {
        throw new Error('Invalid poll, option, or user');
    }

    const existingVote = await prisma.pollVote.findFirst({
        where: {
            pollId,
            userId,
        },
    });

    if (existingVote) {
        throw new Error('User has already voted in this poll');
    }

    const vote = await prisma.pollVote.create({
        data: {
            pollId,
            pollOptionId,
            userId,
        },
    });

    return vote;
}

module.exports = {
  castVote,
};