import { BusinessNameRepo } from "../domain/types";
import knex, { Knex } from "knex";

type DatabaseNameEntity = {
  name: string;
};

export const PostgresBusinessNameRepo = (connection: Knex.PgConnectionConfig | string): BusinessNameRepo => {
  const kdb = knex({
    client: "pg",
    connection: connection,
  });

  const tableName = "businessnames";

  const search = (name: string): Promise<string[]> => {
    return kdb(tableName)
      .select("name")
      .where("name", "ILIKE", `%${name}%`)
      .then((data: DatabaseNameEntity[]) => data.map((it) => it.name))
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  const save = (name: string): Promise<void> => {
    return kdb(tableName)
      .insert({ name: name })
      .then(() => {
        return;
      })
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  const disconnect = async (): Promise<void> => {
    await kdb.destroy();
  };

  const deleteAll = async (): Promise<void> => {
    await kdb(tableName).del();
  };

  return {
    search,
    save,
    disconnect,
    deleteAll,
  };
};
