const mongoose = require('mongoose');

const uri = 'mongodb+srv://vikashgupta67429_db_user:DlBvLGdGlJWvEEGp@cluster0.z5zc3wb.mongodb.net/SmartRentalDB';

mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const properties = await db.collection('properties').find({}).toArray();
    console.log(JSON.stringify(properties, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
