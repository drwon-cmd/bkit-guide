// Database Adapter - Standalone MongoDB connection

import { MongoClient, Db, Collection, Document as MongoDocument } from 'mongodb';

export interface DbAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getCollection<T extends MongoDocument>(name: string): Collection<T>;
  isConnected(): boolean;
}

export class MongoAtlasAdapter implements DbAdapter {
  private client: MongoClient;
  private database: Db | null = null;
  private dbName: string;
  private connected = false;

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.client.connect();
    this.database = this.client.db(this.dbName);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  getCollection<T extends MongoDocument>(name: string): Collection<T> {
    if (!this.database) throw new Error('Database not connected');
    return this.database.collection<T>(name);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

let dbInstance: DbAdapter | null = null;

export function getDbAdapter(): DbAdapter {
  if (!dbInstance) {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'bkit_guide';
    if (!uri) throw new Error('MONGODB_URI not set');
    dbInstance = new MongoAtlasAdapter(uri, dbName);
  }
  return dbInstance;
}

// Lazy proxy - doesn't throw at import time, only when accessed at runtime
export const db: DbAdapter = {
  connect: () => getDbAdapter().connect(),
  disconnect: () => getDbAdapter().disconnect(),
  getCollection: <T extends MongoDocument>(name: string) => getDbAdapter().getCollection<T>(name),
  isConnected: () => {
    try {
      return getDbAdapter().isConnected();
    } catch {
      return false;
    }
  },
};
