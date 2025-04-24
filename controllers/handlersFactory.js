const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError("no document found", 404));
    }
    // trigger the remove event when delete document
    await document.deleteOne();
    res.status(204).send();
  });
exports.deactivateUser = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findById(id);
    if (!document) {
      return next(new ApiError("no document found", 404));
    }
    document.active = !document.active;
    await document.save();
    res.status(200).json({
      msg: document.active
        ? "the user is activated successfully"
        : "the user is deactivated successfully",
      user: document,
    });
  });
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError("no document found", 404));
    }
    // trigger the save event when update document
    document.save();
    res
      .status(201)
      .json({ message: "document is updated successfully", document });
  });
exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const document = await model.create(req.body);
    res
      .status(201)
      .json({ message: "document is created successfully", data: document });
  });
exports.getOne = (model, populationOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = model.findById(id);
    if (populationOptions) {
      query = query.populate(populationOptions);
    }
    const document = await query;
    if (!document) {
      return next(new ApiError("no document found", 404));
    }
    res.status(201).json({ document });
  });
exports.getCount = (model) =>
  asyncHandler(async (req, res, next) => {
    const documentsCount = await model.countDocuments();
    if (!documentsCount && documentsCount !== 0) {
      return next(new ApiError("no brands found", 404));
    }
    res.status(201).json({ documentsCount });
  });
exports.getAll = (model, ...filteredNames) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filteredObj) filter = req.filteredObj;
    //search("title", "description")
    const documentsCount = await model.countDocuments();
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(documentsCount)
      .filter()
      .search(filteredNames)
      .limitFields()
      .sort();
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(201)
      .json({ paginationResult, results: documents.length, data: documents });
  });
