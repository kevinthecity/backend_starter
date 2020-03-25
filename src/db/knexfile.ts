import "../utils/env";
import { ConnectionString } from "connection-string";
import _ from "lodash";

const connection = new ConnectionString(process.env.DATABASE_URL);

const defaults = {
  client: "pg",
  connection: {
    user: connection.user || "root",
    password: connection.password || "",
    host: connection.hosts && connection.hosts[0].name,
    port: (connection.hosts && connection.hosts[0].port) || 5432,
    database: connection.path[0]
  },
  migrations: {
    directory: `${__dirname}/db/migrations`
  },
  seeds: {
    directory: `${__dirname}/db/seeds`
  },
  debug: false,
  onUpdateTrigger: table => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `
};

const environments = {
  production: {
    pool: {
      min: 2,
      max: 10
    }
  }
};

export const config = _.merge(defaults, environments[process.env.NODE_ENV]);
export default config;
