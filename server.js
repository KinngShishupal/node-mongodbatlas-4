// this is the first file

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
const app = require('./app');
// console.log(process.env);
// console.log(app.get('env'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('server is running at port' + port);
});
