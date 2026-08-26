/**
 * ForgeDM (L0): type shim for the OPTIONAL printenvz dependency.
 *
 * printenvz is a tiny vendored native module; its build is skipped on
 * machines/images without MSVC (see root package.json
 * optionalDependencies). Declaring the module here keeps TypeScript -
 * including the production webpack build of the unit-test sources -
 * compiling when the package is absent at install time. At runtime the
 * binary is only used as a fast-path by lib/hooks/get-shell-env.ts,
 * which falls back to spawning a login shell when it is missing.
 */
declare module 'printenvz' {
  export function getPrintenvzPath(): string
}
