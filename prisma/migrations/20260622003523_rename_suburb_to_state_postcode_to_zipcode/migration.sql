/*
  Warnings:

  - You are about to drop the column `postCode` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `suburb` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `postCode` on the `dealers` table. All the data in the column will be lost.
  - You are about to drop the column `suburb` on the `dealers` table. All the data in the column will be lost.
  - You are about to drop the column `postCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `suburb` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "postCode",
DROP COLUMN "suburb",
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "dealers" DROP COLUMN "postCode",
DROP COLUMN "suburb",
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "postCode",
DROP COLUMN "suburb",
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;
