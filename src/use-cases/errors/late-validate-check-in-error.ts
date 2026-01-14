export class LateValidateCheckInError extends Error {
  constructor() {
    super(
      "This check-in can only be validated until 20 minutes of its creation."
    );
  }
}
