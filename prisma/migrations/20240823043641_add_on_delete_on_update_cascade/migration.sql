-- DropForeignKey
ALTER TABLE "CaffeManager" DROP CONSTRAINT "CaffeManager_caffeId_fkey";

-- DropForeignKey
ALTER TABLE "CaffeManager" DROP CONSTRAINT "CaffeManager_managerId_fkey";

-- DropForeignKey
ALTER TABLE "CaffeOwner" DROP CONSTRAINT "CaffeOwner_caffeId_fkey";

-- DropForeignKey
ALTER TABLE "CaffeOwner" DROP CONSTRAINT "CaffeOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_caffeId_fkey";

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeOwner" ADD CONSTRAINT "CaffeOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeOwner" ADD CONSTRAINT "CaffeOwner_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeManager" ADD CONSTRAINT "CaffeManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaffeManager" ADD CONSTRAINT "CaffeManager_caffeId_fkey" FOREIGN KEY ("caffeId") REFERENCES "Caffe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
