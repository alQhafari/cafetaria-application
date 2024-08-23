import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.menu.deleteMany();
  await prisma.caffe.deleteMany();
  await prisma.user.deleteMany();
  // Example: Creating users
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
