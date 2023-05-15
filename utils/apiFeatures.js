// the main reason to create this is to call filtering sorting limiting etc separately
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'page', 'fields']; // as these things are handled in separate ways in mongoose
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log('rrrrrrr', queryObj);

    // ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // mongdb sort sort('a b c');
      const sortBY = this.queryString.sort.split(',').join(' '); // this removes comma from api sort with empty space
      this.query = this.query.sort(sortBY);
    } else {
      this.query = this.query.sort('-createdAt'); // default sort based on creation date
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const selectedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // converting string into number and also default page as 1;
    const limit = this.queryString.limit * 1 || 100;
    const skipValue = (page - 1) * limit;
    this.query = this.query.skip(skipValue).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
