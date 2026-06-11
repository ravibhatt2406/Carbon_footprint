const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

const defaultDb = {
  users: [],
  footprints: [],
  goals: [],
  challenges: [],
  badges: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf8');
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading mock database, using in-memory fallback:', err);
    return defaultDb;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing mock database:', err);
  }
}

const dbMock = {
  getCollection(collectionName) {
    const db = readDb();
    if (!db[collectionName]) {
      db[collectionName] = [];
    }
    return db[collectionName];
  },

  find(collectionName, queryFn) {
    const list = this.getCollection(collectionName);
    return list.filter(queryFn);
  },

  findOne(collectionName, queryFn) {
    const list = this.getCollection(collectionName);
    return list.find(queryFn);
  },

  findById(collectionName, id) {
    return this.findOne(collectionName, item => item.id === id);
  },

  insert(collectionName, doc) {
    const db = readDb();
    if (!db[collectionName]) {
      db[collectionName] = [];
    }
    const newDoc = {
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...doc
    };
    db[collectionName].push(newDoc);
    writeDb(db);
    return newDoc;
  },

  update(collectionName, id, updates) {
    const db = readDb();
    const list = db[collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
      writeDb(db);
      return list[index];
    }
    return null;
  },

  delete(collectionName, id) {
    const db = readDb();
    const list = db[collectionName] || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = list.splice(index, 1)[0];
      writeDb(db);
      return deleted;
    }
    return null;
  }
};

module.exports = dbMock;
