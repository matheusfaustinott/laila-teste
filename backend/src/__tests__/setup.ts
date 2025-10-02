process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};
