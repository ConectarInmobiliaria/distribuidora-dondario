-- CreateTable
CREATE TABLE "Deliverer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryBatch" (
    "id" SERIAL NOT NULL,
    "delivererId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryBatchItem" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "saleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryBatchItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeliveryBatch" ADD CONSTRAINT "DeliveryBatch_delivererId_fkey" FOREIGN KEY ("delivererId") REFERENCES "Deliverer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryBatchItem" ADD CONSTRAINT "DeliveryBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DeliveryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryBatchItem" ADD CONSTRAINT "DeliveryBatchItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
