import Knex from "knex";

/**
 * Query a row to return non-deleted rows (useful when doing soft deletes)
 */
export const notDeleted = (query: Knex.QueryBuilder<any, unknown[]>) => {
  return query.whereNull("deleted").orWhere({ deleted: false });
};
