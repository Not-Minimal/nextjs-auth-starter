/*
  Warnings:

  - You are about to drop the column `expires_at` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "expires_at",
ADD COLUMN     "access_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "refresh_token_expires_at" TIMESTAMP(3);
