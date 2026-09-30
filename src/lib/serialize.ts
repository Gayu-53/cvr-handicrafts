/**
 * Prisma returns `Decimal` objects for money columns (price, salePrice, ...).
 * React cannot pass class instances from Server Components to Client Components,
 * which triggers:
 *   "Only plain objects can be passed to Client Components from Server
 *    Components. Decimal objects are not supported."
 *
 * Call this on any Prisma result BEFORE handing it to a Client Component.
 * Decimal -> string (e.g. "270"), Date -> ISO string. Every consumer in this
 * project already reads prices via Number(...) / formatINR(...), which both
 * accept strings, so behaviour is unchanged — only the warning goes away.
 */
export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
