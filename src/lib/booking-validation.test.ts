import { describe, expect, it } from "vitest";
import { validateBooking } from "./booking-validation";

describe("validateBooking", () => {
  it("accepts a complete booking request", () => {
    expect(validateBooking({
      customerName: "أحمد",
      phone: "0501234567",
      vehicle: "هيونداي سنتافي ٢٠١٩",
      service: "صيانة دورية",
    })).toEqual([]);
  });

  it("rejects missing customer, invalid phone, and missing vehicle", () => {
    expect(validateBooking({
      customerName: " ",
      phone: "12",
      vehicle: "",
      service: "فحص كمبيوتر",
    })).toEqual(["customerName", "phone", "vehicle"]);
  });
});
