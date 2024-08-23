-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'OWNER', 'MANAGER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caffe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Caffe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isRecommendation" BOOLEAN NOT NULL,
    "caffeId" INTEGER NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaffeOwner" (
    "ownerId" INTEGER NOT NULL,
    "caffeId" INTEGER NOT NULL,

    CONSTRAINT "CaffeOwner_pkey" PRIMARY KEY ("ownerId","caffeId")
);

-- CreateTable
CREATE TABLE "CaffeManager" (
    "managerId" INTEGER NOT NULL,
    "caffeId" INTEGER NOT NULL,

    CONSTRAINT "CaffeManager_pkey" PRIMARY KEY ("managerId","caffeId")
);

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeOwner" ADD CONSTRAINT "CaffeOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeOwner" ADD CONSTRAINT "CaffeOwner_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeManager" ADD CONSTRAINT "CaffeManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeManager" ADD CONSTRAINT "CaffeManager_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
