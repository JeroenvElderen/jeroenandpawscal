-- DropForeignKey
ALTER TABLE "public"."RoutingFormResponseField" DROP CONSTRAINT "RoutingFormResponseField_responseId_fkey";

-- AlterTable
ALTER TABLE "public"."RoutingFormResponseField" ADD COLUMN     "routingFormResponseDenormalizedId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."RoutingFormResponseField" ADD CONSTRAINT "RoutingFormResponseField_routingFormResponseDenormalizedId_fkey" FOREIGN KEY ("routingFormResponseDenormalizedId") REFERENCES "public"."RoutingFormResponseDenormalized"("id") ON DELETE SET NULL ON UPDATE CASCADE;
