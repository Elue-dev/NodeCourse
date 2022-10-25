class APIFeatures {
  //mongoose query, query strig from express (req.query)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    // exclude special field names from our query string before we do the FILTERING
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gr|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // defaut - descending order of createdAt
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //called projecting
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // build query

    // PAGINATION
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;

    //let's say we are requesting page number 3 with a limit of 10, it means we would have to sip 20 results (which is basically 2 * 10), so 2 times the limit
    const skip = (page - 1) * limit;
    // page=2&limit=10    skip - certain results before you start querying (1-10, 11-20, 21-30 etc...)
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
