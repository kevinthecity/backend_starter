import Knex from "knex";
import knexStringcase from "knex-stringcase";
import { merge } from "lodash";
import knexfile from "../../knexfile";

/**
 * Thos most important note here, is that your postgres columns are snake_cased,
 * however the `knexStringcase` method converts everything to camelcase, so you
 * rarely (if ever) actually refer to columns by their snake_case names.
 */
class Database {
  private knexInstance: Knex;
  private config: Knex.Config;

  connect(options = {}): void {
    if (this.knexInstance) {
      return;
    }

    this.config = merge({}, knexfile, options);
    this.knexInstance = Knex(knexStringcase(this.config));
  }

  get query(): Knex {
    if (!this.knexInstance) {
      this.connect();
    }

    return this.knexInstance;
  }

  close(callback: any): void {
    if (!this.knexInstance) {
      callback();
      return;
    }

    this.knexInstance.destroy(callback);
  }

  knex(): Knex {
    if (!this.knexInstance) {
      this.connect();
    }
    return this.knexInstance;
  }
}

export default new Database();
