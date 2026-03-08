import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class LinksRepository {
  create(createDto: Prisma.LinkCreateArgs) {
    return prisma.link.create(createDto);
  }

  createMany(createManyDto: Prisma.LinkCreateManyArgs) {
    return prisma.link.createMany(createManyDto);
  }

  findUnique(findUniqueDto: Prisma.LinkFindUniqueArgs) {
    return prisma.link.findUnique(findUniqueDto);
  }

  findAll(findAllDto: Prisma.LinkFindManyArgs) {
    return prisma.link.findMany(findAllDto);
  }

  findFirst(findFirstDto: Prisma.LinkFindFirstArgs) {
    return prisma.link.findFirst(findFirstDto);
  }

  update(updateDto: Prisma.LinkUpdateArgs) {
    return prisma.link.update(updateDto);
  }

  delete(deleteDto: Prisma.LinkDeleteArgs) {
    return prisma.link.delete(deleteDto);
  }
}