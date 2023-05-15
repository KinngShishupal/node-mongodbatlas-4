const fs = require('fs');
const Tour = require('../../models/TourModel');
const dotEnv = require('dotenv');

dotEnv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // strictQuery: false,
  })
  .then(() => console.log('databse connected successfully'))
  .catch((err) => console.log('error++++++++', err));
// const app = require('./app');
// console.log(process.env);
// console.log(app.get('env'));

// read data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded into database successfully ...');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// delete  data from  database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted from database successfully ...');
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
// node dev-data/data/import-dev-data.js
// we run this file through above command it shows an array with two values, one with node location
// an other with file location
// we can add third value as node dev-data/data/import-dev-data.js --import
// here import or whatever we write there gets set as third value
// so we have used process.argv[2] to run our functions
