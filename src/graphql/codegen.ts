/**
 * This is the file that GraphQL Codegen references to add types into some of your resolvers
 * where the types cannot be inferred.
 */

export interface Context {
  user?: User;
  authenticationPresent: boolean;
  error?: {
    message: string;
  };
}

interface User {
  id: string;
}
