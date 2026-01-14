import { Gym, Prisma } from "generated/prisma";

export interface FetchNearbyGymsParams {
  latitude: number;
  longitude: number;
}

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>;
  searchMany(query: string, page: number): Promise<Gym[]>;
  fetchNearby(params: FetchNearbyGymsParams): Promise<Gym[]>;
  create(data: Prisma.GymCreateInput): Promise<Gym>;
}
