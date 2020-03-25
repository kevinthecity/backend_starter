import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import { findUserByToken as createUserContext } from "./auth/authenticationUtils";
import { logger } from "./utils/winstonLogger";
import schema from "./graphql/schema";

class Server {
  app: express.Application;
  server: http.Server;
  apollo: ApolloServer;

  constructor() {
    this.app = express();
    this.app.set("json spaces", 4);
    this.apollo = new ApolloServer({
      schema,
      context: async ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || "";
        return await createUserContext(token);
      },
      formatError: err => {
        // https://www.apollographql.com/docs/apollo-server/features/errors/#masking-and-logging-errors
        logger.error(err);
        return err;
      }
    });
    this.middleware();
    this.routes();

    // You may need to uncomment this as your app grows
    // EventEmitter.defaultMaxListeners = 15;
  }

  /**
   * A lot of this middleware may no longer be necessary in more recent apollo server updates.
   */
  middleware() {
    // https://github.com/expressjs/morgan/issues/116#issuecomment-240242129
    morgan.token("graphql-query", req => {
      const { query, variables, operationName } = req.body;
      return `GRAPHQL: \nOperation Name: ${operationName} \nQuery: ${query} \nVariables: ${JSON.stringify(
        variables
      )}`;
    });
    this.app.use(bodyParser.json());
    this.app.use(morgan(":graphql-query"));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static("src/public"));

    this.apollo.applyMiddleware({
      app: this.app
    });
  }

  routes() {
    /**
     * Here is where you can route some non-graphql stuff, if you need to.
     */
    const router = express.Router();
    this.app.use("/", router);
    this.app.get("/", (request, response) => {
      response.send("Nothin' to see here, move along...");
    });
  }

  start(cb = () => null) {
    const port = process.env.PORT || 3000;

    this.server = this.app.listen(port, () => {
      logger.info(
        `🚀 Visit graphiql browser at http://localhost:${port}${this.apollo.graphqlPath}`
      );
      cb();
    });
  }

  stop(cb = () => null) {
    if (this.server) {
      this.server.close(cb);
    }
  }
}

export default new Server();
