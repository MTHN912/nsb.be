-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_dealerId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dealerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
