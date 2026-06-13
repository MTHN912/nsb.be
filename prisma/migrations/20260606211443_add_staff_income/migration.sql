-- CreateTable
CREATE TABLE "staff_incomes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "inComeDate" TIMESTAMP(3) NOT NULL,
    "staffComissonId" INTEGER,
    "staffTipsId" INTEGER,
    "serviceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_incomes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "staff_incomes" ADD CONSTRAINT "staff_incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_incomes" ADD CONSTRAINT "staff_incomes_staffComissonId_fkey" FOREIGN KEY ("staffComissonId") REFERENCES "staff_commissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_incomes" ADD CONSTRAINT "staff_incomes_staffTipsId_fkey" FOREIGN KEY ("staffTipsId") REFERENCES "staff_tips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_incomes" ADD CONSTRAINT "staff_incomes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
