import { vi } from "vitest";

// The real package throws when imported outside Next's server compiler
// (which is how it guarantees server-only code never reaches the client
// bundle). That guarantee is a build-time concern; in the test runner we
// just need it to be a no-op so modules that import it can be tested.
vi.mock("server-only", () => ({}));
