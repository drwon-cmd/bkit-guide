// Create MongoDB Atlas Vector Search indexes
const { MongoClient } = require('mongodb');

async function createIndexes() {
  // Try to load from .env.local
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch {
    // dotenv not installed, use env vars directly
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable not set');
    console.log('Set it in .env.local or as environment variable');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB connected');

    const db = client.db(process.env.MONGODB_DB_NAME || 'bkit_guide');

    // Create vector search index for bkit_github_docs
    console.log('Creating bkit_github_docs index...');
    try {
      await db.command({
        createSearchIndexes: 'bkit_github_docs',
        indexes: [{
          name: 'vector_index',
          definition: {
            mappings: {
              dynamic: true,
              fields: {
                embedding: {
                  type: 'knnVector',
                  dimensions: 384,
                  similarity: 'cosine'
                }
              }
            }
          }
        }]
      });
      console.log('✅ bkit_github_docs vector_index created');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️  bkit_github_docs vector_index already exists');
      } else {
        console.log('❌ bkit_github_docs:', e.message);
      }
    }

    // Create vector search index for bkit_qa_embeddings
    console.log('Creating bkit_qa_embeddings index...');
    try {
      await db.command({
        createSearchIndexes: 'bkit_qa_embeddings',
        indexes: [{
          name: 'vector_index',
          definition: {
            mappings: {
              dynamic: true,
              fields: {
                embedding: {
                  type: 'knnVector',
                  dimensions: 384,
                  similarity: 'cosine'
                }
              }
            }
          }
        }]
      });
      console.log('✅ bkit_qa_embeddings vector_index created');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('ℹ️  bkit_qa_embeddings vector_index already exists');
      } else {
        console.log('❌ bkit_qa_embeddings:', e.message);
      }
    }

    console.log('\nDone!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.close();
  }
}

createIndexes();
