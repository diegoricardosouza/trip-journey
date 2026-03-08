import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class ActivitiesRepository {
  create(createDto: Prisma.ActivityCreateArgs) {
    return prisma.activity.create(createDto);
  }

  createMany(createManyDto: Prisma.ActivityCreateManyArgs) {
    return prisma.activity.createMany(createManyDto);
  }

  findUnique(findUniqueDto: Prisma.ActivityFindUniqueArgs) {
    return prisma.activity.findUnique(findUniqueDto);
  }

  findAll(findAllDto: Prisma.ActivityFindManyArgs) {
    return prisma.activity.findMany(findAllDto);
  }

  findFirst(findFirstDto: Prisma.ActivityFindFirstArgs) {
    return prisma.activity.findFirst(findFirstDto);
  }

  update(updateDto: Prisma.ActivityUpdateArgs) {
    return prisma.activity.update(updateDto);
  }

  delete(deleteDto: Prisma.ActivityDeleteArgs) {
    return prisma.activity.delete(deleteDto);
  }
}