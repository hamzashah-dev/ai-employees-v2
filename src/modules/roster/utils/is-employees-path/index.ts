import { EMPLOYEES_ROUTE_ROOTS, MODE_STICKY_ROUTE_ROOTS } from '../../constants'

const isUnder = (pathname: string, root: string) =>
  pathname === root || pathname.startsWith(`${root}/`)

/**
 * True for the routes that own the Employees sidebar. Same shape as
 * imagine-computer-web's `isMakePath` — exact match or a child segment —
 * widened to the several roots Employees owns.
 */
export const isEmployeesPath = (pathname: string) =>
  EMPLOYEES_ROUTE_ROOTS.some((root) => isUnder(pathname, root))

/** True for routes that leave the current mode alone instead of resetting it. */
export const isModeStickyPath = (pathname: string) =>
  MODE_STICKY_ROUTE_ROOTS.some((root) => isUnder(pathname, root))
