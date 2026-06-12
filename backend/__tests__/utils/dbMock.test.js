const fs = require('fs');
const dbMock = require('../../utils/dbMock');

jest.mock('fs');

describe('dbMock Utility', () => {
  let mockDbData;

  beforeEach(() => {
    mockDbData = {
      users: [
        { id: '1', email: 'test@test.com', displayName: 'Test User' }
      ],
      footprints: [],
      goals: [],
      challenges: [],
      badges: []
    };
    
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockImplementation(() => JSON.stringify(mockDbData));
    fs.writeFileSync.mockImplementation((path, data) => {
      mockDbData = JSON.parse(data);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('correctly reads collection contents', () => {
    const users = dbMock.getCollection('users');
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('test@test.com');
  });

  it('finds items based on query function', () => {
    const matches = dbMock.find('users', u => u.id === '1');
    expect(matches).toHaveLength(1);

    const noMatches = dbMock.find('users', u => u.id === '999');
    expect(noMatches).toHaveLength(0);
  });

  it('finds a single item by query or ID', () => {
    const user = dbMock.findOne('users', u => u.email === 'test@test.com');
    expect(user).toBeDefined();
    expect(user.id).toBe('1');

    const userById = dbMock.findById('users', '1');
    expect(userById).toBeDefined();
    expect(userById.displayName).toBe('Test User');
  });

  it('inserts a document and assigns an ID and timestamp', () => {
    const doc = { email: 'new@test.com', displayName: 'New User' };
    const inserted = dbMock.insert('users', doc);

    expect(inserted.id).toBeDefined();
    expect(inserted.createdAt).toBeDefined();
    expect(inserted.email).toBe('new@test.com');
    expect(dbMock.getCollection('users')).toHaveLength(2);
  });

  it('updates a document successfully', () => {
    const updated = dbMock.update('users', '1', { displayName: 'Updated Name' });
    expect(updated).toBeDefined();
    expect(updated.displayName).toBe('Updated Name');
    expect(updated.updatedAt).toBeDefined();
    expect(dbMock.findById('users', '1').displayName).toBe('Updated Name');
  });

  it('deletes a document successfully', () => {
    const deleted = dbMock.delete('users', '1');
    expect(deleted).toBeDefined();
    expect(deleted.id).toBe('1');
    expect(dbMock.getCollection('users')).toHaveLength(0);
  });
});
