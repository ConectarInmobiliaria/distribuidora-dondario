/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commission` to the `Seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `Seller` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "commission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dni" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Seller_dni_key" ON "Seller"("dni");
