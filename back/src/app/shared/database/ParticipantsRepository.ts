import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class ParticipantsRepository {
  create(createDto: Prisma.ParticipantCreateArgs) {
    return prisma.participant.create(createDto);
  }

  createMany(createManyDto: Prisma.ParticipantCreateManyArgs) {
    return prisma.participant.createMany(createManyDto);
  }

  findUnique(findUniqueDto: Prisma.ParticipantFindUniqueArgs) {
    return prisma.participant.findUnique(findUniqueDto);
  }

  findAll(findAllDto: Prisma.ParticipantFindManyArgs) {
    return prisma.participant.findMany(findAllDto);
  }

  findFirst(findFirstDto: Prisma.ParticipantFindFirstArgs) {
    return prisma.participant.findFirst(findFirstDto);
  }

  update(updateDto: Prisma.ParticipantUpdateArgs) {
    return prisma.participant.update(updateDto);
  }

  delete(deleteDto: Prisma.ParticipantDeleteArgs) {
    return prisma.participant.delete(deleteDto);
  }
}