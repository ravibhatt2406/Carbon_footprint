/**
 * @module dataAccess
 * Unified data access layer that abstracts the simulation/Firestore branching.
 * Controllers call these functions instead of duplicating `useSimulation ? dbMock : db` logic.
 */
const { db, useSimulation } = require('../config/firebase');
const dbMock = require('./dbMock');

/**
 * Finds all documents in a collection matching a query.
 * @param {string} collection - The collection name
 * @param {Object} [options] - Query options
 * @param {Function} [options.filterFn] - Filter function for simulation mode (receives document)
 * @param {Array<{field: string, op: string, value: *}>} [options.where] - Firestore where clauses
 * @param {string} [options.orderBy] - Field to order by
 * @param {'asc'|'desc'} [options.orderDir='desc'] - Order direction
 * @param {number} [options.limit] - Maximum documents to return
 * @returns {Promise<Array>} Array of matching documents
 */
async function findDocuments(collection, options = {}) {
  const { filterFn, where = [], orderBy, orderDir = 'desc', limit } = options;

  if (useSimulation) {
    let results = filterFn
      ? dbMock.find(collection, filterFn)
      : dbMock.getCollection(collection);

    if (orderBy) {
      const dir = orderDir === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        const aVal = new Date(a[orderBy]);
        const bVal = new Date(b[orderBy]);
        return dir * (aVal - bVal);
      });
    }

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  // Firestore mode
  let query = db.collection(collection);

  for (const clause of where) {
    query = query.where(clause.field, clause.op, clause.value);
  }

  if (orderBy) {
    query = query.orderBy(orderBy, orderDir);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const snapshot = await query.get();
  const docs = [];
  snapshot.forEach(doc => {
    docs.push({ id: doc.id, ...doc.data() });
  });
  return docs;
}

/**
 * Finds a single document in a collection matching a query.
 * @param {string} collection - The collection name
 * @param {Function} filterFn - Filter function for simulation mode
 * @param {string} [docId] - Direct document ID lookup for Firestore mode
 * @returns {Promise<Object|null>} The matching document, or null
 */
async function findOneDocument(collection, filterFn, docId) {
  if (useSimulation) {
    let result;
    if (docId && typeof dbMock.findById === 'function') {
      try {
        result = dbMock.findById(collection, docId);
        if (result && result.id && result.id !== docId) {
          result = undefined;
        }
      } catch (e) {
        // Ignore
      }
    }
    if (result === undefined && typeof dbMock.findOne === 'function') {
      try {
        result = dbMock.findOne(collection, filterFn);
      } catch (e) {
        // Ignore
      }
    }
    return result || null;
  }

  if (docId) {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  return null;
}

/**
 * Inserts a new document into a collection.
 * @param {string} collection - The collection name
 * @param {Object} data - Document data to insert
 * @returns {Promise<Object>} The inserted document with generated ID
 */
async function insertDocument(collection, data) {
  if (useSimulation) {
    return dbMock.insert(collection, data);
  }

  const ref = await db.collection(collection).add(data);
  return { id: ref.id, ...data };
}

/**
 * Updates an existing document in a collection.
 * @param {string} collection - The collection name
 * @param {string} id - Document ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} The updated document
 */
async function updateDocument(collection, id, updates) {
  if (useSimulation) {
    return dbMock.update(collection, id, updates);
  }

  const ref = db.collection(collection).doc(id);
  await ref.update(updates);
  const updated = await ref.get();
  return { id, ...updated.data() };
}

/**
 * Gets the count of documents matching criteria.
 * @param {string} collection - The collection name
 * @param {Function} filterFn - Filter function for simulation mode
 * @param {Array<{field: string, op: string, value: *}>} [where] - Firestore where clauses
 * @returns {Promise<number>} Count of matching documents
 */
async function countDocuments(collection, filterFn, where = []) {
  if (useSimulation) {
    return dbMock.find(collection, filterFn).length;
  }

  let query = db.collection(collection);
  for (const clause of where) {
    query = query.where(clause.field, clause.op, clause.value);
  }
  const snapshot = await query.get();
  return snapshot.size;
}

module.exports = {
  findDocuments,
  findOneDocument,
  insertDocument,
  updateDocument,
  countDocuments,
  useSimulation,
  db,
};
