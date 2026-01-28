// Debug API for testing MongoDB connection
import { NextResponse } from 'next/server';
import { db } from '@/lib/adapters';

export async function GET() {
  try {
    // Test connection
    console.log('isConnected before:', db.isConnected());
    await db.connect();
    console.log('isConnected after:', db.isConnected());

    // Get collection
    const collection = db.getCollection('debug_test');

    // Insert test document
    const insertResult = await collection.insertOne({
      test: true,
      timestamp: new Date(),
    });
    console.log('Insert result:', insertResult);

    // Count documents
    const count = await collection.countDocuments();
    console.log('Count:', count);

    // Clean up
    await collection.deleteMany({});

    return NextResponse.json({
      success: true,
      insertedId: insertResult.insertedId.toString(),
      countBeforeDelete: count,
      dbName: process.env.MONGODB_DB_NAME || 'bkit_guide',
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
