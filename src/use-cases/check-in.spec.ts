import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { Decimal } from "generated/prisma/runtime/library";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check In Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    gymsRepository.items.push({
      id: "gym-1",
      title: "Academia 1",
      description: "Academia 1",
      phone: "1234567890",
      latitude: new Decimal(0),
      longitude: new Decimal(0),
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
      userLatitude: -27.07479,
      userLongitude: -49.4889672,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2026, 0, 13, 8, 0, 0));
    await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -27.07479,
      userLongitude: -49.4889672,
    });

    await expect(() =>
      sut.execute({
        userId: "user-1",
        gymId: "gym-1",
        userLatitude: -27.07479,
        userLongitude: -49.4889672,
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it("should be able to check in twice but in different days", async () => {
    vi.setSystemTime(new Date(2026, 0, 13, 8, 0, 0));
    await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -27.07479,
      userLongitude: -49.4889672,
    });

    vi.setSystemTime(new Date(2026, 0, 14, 8, 0, 0));

    const { checkIn } = await sut.execute({
      userId: "user-1",
      gymId: "gym-1",
      userLatitude: -27.07479,
      userLongitude: -49.4889672,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });
});
