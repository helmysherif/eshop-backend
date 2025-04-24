const transformQuery = require("./helperFunctions");
class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter() {
    const queryStringObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryStringObj[field]);
    this.mongooseQuery = this.mongooseQuery.find(
      transformQuery(queryStringObj)
    );
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }
  search(...searchNames) {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.trim();
      const searchQuery = { $or: [] };
      searchNames[0].forEach((name) => {
        searchQuery.$or.push({ [name]: { $regex: keyword, $options: "i" } });
      });
      this.mongooseQuery = this.mongooseQuery.find(searchQuery);
    }
    return this;
  }
  paginate(documentsCount) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endPageIndex = page * limit;
    // pagination results
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.noOfPages = Math.ceil(documentsCount / limit);
    if (endPageIndex < documentsCount) {
      pagination.nextPage = page + 1;
    }
    if (skip > 0) {
      pagination.prevPage = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}
module.exports = ApiFeatures;
