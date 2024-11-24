import * as TE from 'fp-ts/TaskEither';
import mongoose, { Connection } from 'mongoose';

export const createMongoConnection = (
  uri: string
): TE.TaskEither<Error, Connection> =>
  TE.tryCatch<Error, Connection>(
    async (): Promise<Connection> => {
      const connection = await mongoose
        .createConnection(uri, {
          dbName: 'video',
          maxPoolSize: 10,
        })
        .asPromise();
      console.log('MongoDB connected successfully');
      return connection;
    },
    (reason) => new Error(`MongoDB connection failed: ${String(reason)}`)
  );

export const closeMongoConnection = (
  connection: Connection
): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    async () => {
      await connection.close();
      console.log('MongoDB connection closed successfully');
    },
    (reason) =>
      new Error(`Failed to close MongoDB connection: ${String(reason)}`)
  );
