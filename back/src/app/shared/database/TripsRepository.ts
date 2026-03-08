import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export class TripsRepository {
  create(createDto: Prisma.TripCreateArgs) {
    return prisma.trip.create(createDto);
  }

  createMany(createManyDto: Prisma.TripCreateManyArgs) {
    return prisma.trip.createMany(createManyDto);
  }

  findUnique<T extends Prisma.TripFindUniqueArgs>(findUniqueDto: T) {
    return prisma.trip.findUnique(findUniqueDto) as Promise<Prisma.TripGetPayload<T> | null>;
  }

  findAll<T extends Prisma.TripFindManyArgs>(findAllDto?: T) {
    return prisma.trip.findMany(findAllDto) as Promise<Prisma.TripGetPayload<T>[]>;
  }

  findFirst<T extends Prisma.TripFindFirstArgs>(findFirstDto: T) {
    return prisma.trip.findFirst(findFirstDto) as Promise<Prisma.TripGetPayload<T> | null>;
  }

  update<T extends Prisma.TripUpdateArgs>(updateDto: T) {
    return prisma.trip.update(updateDto) as unknown as Promise<Prisma.TripGetPayload<T>>;
  }

  delete(deleteDto: Prisma.TripDeleteArgs) {
    return prisma.trip.delete(deleteDto);
  }
}