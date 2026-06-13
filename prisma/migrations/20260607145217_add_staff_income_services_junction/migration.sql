/*
  Warnings:

  - You are about to drop the column `serviceId` on the `staff_incomes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "staff_incomes" DROP CONSTRAINT "staff_incomes_serviceId_fkey";

-- AlterTable
ALTER TABLE "staff_incomes" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "staff_income_services" (
    "id" SERIAL NOT NULL,
    "staffIncomeId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_income_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_income_services_staffIncomeId_serviceId_key" ON "staff_income_services"("staffIncomeId", "serviceId");

-- AddForeignKey
ALTER TABLE "staff_income_services" ADD CONSTRAINT "staff_income_services_staffIncomeId_fkey" FOREIGN KEY ("staffIncomeId") REFERENCES "staff_incomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_income_services" ADD CONSTRAINT "staff_income_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
