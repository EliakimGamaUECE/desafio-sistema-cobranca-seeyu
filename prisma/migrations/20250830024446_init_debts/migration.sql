-- CreateEnum
CREATE TYPE "public"."DebtStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateTable
CREATE TABLE "public"."Debt" (
    "id" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "governmentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "debtAmount" DECIMAL(18,2) NOT NULL,
    "debtDueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."DebtStatus" NOT NULL DEFAULT 'PENDING',
    "boletoUrl" TEXT,
    "lastEmailAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paidAmount" DECIMAL(18,2),
    "paidBy" TEXT,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Debt_debtId_key" ON "public"."Debt"("debtId");

-- CreateIndex
CREATE INDEX "Debt_status_idx" ON "public"."Debt"("status");

-- CreateIndex
CREATE INDEX "Debt_email_idx" ON "public"."Debt"("email");

-- CreateIndex
CREATE INDEX "Debt_governmentId_idx" ON "public"."Debt"("governmentId");
