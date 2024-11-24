db = db.getSiblingDB('admin');
db.auth(
  process.env.MONGO_INITDB_ROOT_USERNAME,
  process.env.MONGO_INITDB_ROOT_PASSWORD
);
db.createUser({
  user: 'mongo',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'video' }],
});
