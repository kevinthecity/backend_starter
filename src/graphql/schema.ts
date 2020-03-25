import * as schemas from "../schemas";

import { gql, makeExecutableSchema } from "apollo-server";

/**
 * This file is not meant to be changed. It just collects all the info from schemas
 * and budles it all together.
 */

const BaseQuery = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

const executableSchema = Object.values(schemas).reduce(
  (builder, schema) => {
    builder.typeDefs = [...builder.typeDefs, schema.typeDef];
    builder.resolvers = [...builder.resolvers, schema.resolvers];
    return builder;
  },
  {
    typeDefs: [BaseQuery],
    resolvers: [],
  },
);

export default makeExecutableSchema(executableSchema);
