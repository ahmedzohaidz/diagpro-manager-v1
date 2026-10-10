export type BookingInput = {
  customerName: string;
  phone: string;
  vehicle: string;
  service: string;
};

export function validateBooking(input: BookingInput): string[] {
  const errors: string[] = [];
  if (!input.customerName.trim()) errors.push("customerName");
  if (!/^[0-9+()\- ]{8,20}$/.test(input.phone.trim())) errors.push("phone");
  if (!input.vehicle.trim()) errors.push("vehicle");
  if (!input.service.trim()) errors.push("service");
  return errors;
}
