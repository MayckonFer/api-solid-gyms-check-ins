import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { Decimal } from "generated/prisma/runtime/library";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error";
import { MaxDistanceError } from "./errors/max-distance-error";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check In Use Case", () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    await gymsRepository.create({
      id: "gym-1",
      title: "Academia 1",
      description: "Academia 1",
      phone: "1234567890",
      latitude: -16.7613614,
      longitude: -47.6036372,
    });

    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    vi.setSystemTime(new Date(2026, 0, 13, 8, 0, 0));
    const { checkIn } = await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -16.7613614,
      userLongitude: -47.6036372,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2026, 0, 13, 8, 0, 0));
    await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -16.7613614,
      userLongitude: -47.6036372,
    });

    await expect(() =>
      sut.execute({
        userId: "user-1",
        gymId: "gym-1",
        userLatitude: -16.7613614,
        userLongitude: -47.6036372,
      })
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  it("should be able to check in twice but in different days", async () => {
    vi.setSystemTime(new Date(2026, 0, 13, 8, 0, 0));
    await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -16.7613614,
      userLongitude: -47.6036372,
    });

    vi.setSystemTime(new Date(2026, 0, 14, 8, 0, 0));

    const { checkIn } = await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -16.7613614,
      userLongitude: -47.6036372,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in on distant gym", async () => {
    //-16.7682272,-47.6110685
    gymsRepository.items.push({
      id: "gym-2",
      title: "Academia 1",
      description: "Academia 1",
      phone: "1234567890",
      latitude: new Decimal(-16.7682272),
      longitude: new Decimal(-47.6110685),
    });

    await expect(() =>
      sut.execute({
        userId: "user-1",
        gymId: "gym-2",
        userLatitude: -16.7613614,
        userLongitude: -47.6036372,
      })
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });
});
