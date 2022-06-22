"use strict";

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "Authentication Error";
  }
}
