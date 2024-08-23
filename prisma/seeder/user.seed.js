"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.menu.deleteMany();
    await prisma.caffe.deleteMany();
    await prisma.user.deleteMany();
    const user = await prisma.user.create({
        data: {
            fullname: 'Abi Al Qhafari',
            username: 'abialqhafari',
            password: await bcrypt.hash('123456', 10),
            role: 'SUPERADMIN',
        },
    });
    const user1 = await prisma.user.create({
        data: {
            fullname: 'Farih Akmal',
            username: 'farihakmal',
            password: await bcrypt.hash('123456', 10),
            role: 'OWNER',
        },
    });
    const user2 = await prisma.user.create({
        data: {
            fullname: 'Riyandi',
            username: 'riyandi',
            password: await bcrypt.hash('123456', 10),
            role: 'MANAGER',
        },
    });
    const user3 = await prisma.user.create({
        data: {
            fullname: 'Patria Akbar',
            username: 'patriaakbar',
            password: await bcrypt.hash('123456', 10),
            role: 'MANAGER',
        },
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=user.seed.js.map