// bkit-guide Q&A Store - MongoDB Operations
// Stores all Q&A pairs for crowdsourcing knowledge base

import { ObjectId, Document } from 'mongodb';
import { db } from '@/lib/adapters';

// Q&A Document Schema
export interface BkitQA extends Document {
  _id: ObjectId;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  language: string;
  sessionId: string;
  createdAt: Date;
  metadata?: {
    userAgent?: string;
    ragSourcesUsed?: string[];
    tokensUsed?: number;
  };
}

// Collection name
const COLLECTION_NAME = 'bkit_qa';

// Get collection with lazy connection
async function getCollection() {
  if (!db.isConnected()) {
    await db.connect();
  }
  return db.getCollection<BkitQA>(COLLECTION_NAME);
}

// Create a new Q&A entry
export async function createQA(params: {
  question: string;
  answer: string;
  category: string;
  language: string;
  sessionId: string;
  metadata?: BkitQA['metadata'];
}): Promise<BkitQA> {
  const collection = await getCollection();

  const qa: Omit<BkitQA, '_id'> = {
    question: params.question,
    answer: params.answer,
    category: params.category,
    helpful: 0,
    language: params.language,
    sessionId: params.sessionId,
    createdAt: new Date(),
    metadata: params.metadata,
  };

  const result = await collection.insertOne(qa as BkitQA);

  return {
    _id: result.insertedId,
    ...qa,
  } as BkitQA;
}

// Get Q&A by ID
export async function getQAById(id: string): Promise<BkitQA | null> {
  const collection = await getCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
}

// Update helpful count (feedback)
export async function updateHelpful(
  id: string,
  increment: number
): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { helpful: increment } }
  );
  return result.modifiedCount > 0;
}

// Get recent Q&As by category
export async function getRecentQAs(params: {
  category?: string;
  language?: string;
  limit?: number;
}): Promise<BkitQA[]> {
  const collection = await getCollection();
  const filter: Record<string, unknown> = {};

  if (params.category) {
    filter.category = params.category;
  }
  if (params.language) {
    filter.language = params.language;
  }

  return await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(params.limit || 20)
    .toArray();
}

// Get top helpful Q&As (for suggested questions)
export async function getTopHelpfulQAs(limit: number = 10): Promise<BkitQA[]> {
  const collection = await getCollection();
  return await collection
    .find({ helpful: { $gt: 0 } })
    .sort({ helpful: -1 })
    .limit(limit)
    .toArray();
}

// Get Q&A stats
export async function getQAStats(): Promise<{
  totalQuestions: number;
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
  recentCount: number;
}> {
  const collection = await getCollection();

  const totalQuestions = await collection.countDocuments();

  // Aggregate by category
  const categoryAgg = await collection
    .aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
    .toArray();

  const byCategory: Record<string, number> = {};
  categoryAgg.forEach((item) => {
    byCategory[item._id as string] = item.count;
  });

  // Aggregate by language
  const languageAgg = await collection
    .aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }])
    .toArray();

  const byLanguage: Record<string, number> = {};
  languageAgg.forEach((item) => {
    byLanguage[item._id as string] = item.count;
  });

  // Recent count (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentCount = await collection.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  return {
    totalQuestions,
    byCategory,
    byLanguage,
    recentCount,
  };
}

// Search Q&As by text (basic text search)
export async function searchQAsByText(
  query: string,
  limit: number = 10
): Promise<BkitQA[]> {
  const collection = await getCollection();

  // Create text index if not exists (run once)
  try {
    await collection.createIndex(
      { question: 'text', answer: 'text' },
      { name: 'qa_text_search' }
    );
  } catch {
    // Index might already exist
  }

  return await collection
    .find({ $text: { $search: query } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .toArray();
}

// Ensure indexes
export async function ensureIndexes(): Promise<void> {
  const collection = await getCollection();

  await Promise.all([
    collection.createIndex({ category: 1 }),
    collection.createIndex({ language: 1 }),
    collection.createIndex({ createdAt: -1 }),
    collection.createIndex({ helpful: -1 }),
    collection.createIndex({ sessionId: 1 }),
    collection.createIndex(
      { question: 'text', answer: 'text' },
      { name: 'qa_text_search' }
    ),
  ]);

  console.log('bkit_qa indexes ensured');
}
