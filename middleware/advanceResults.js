const advanceResult = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query

    const reqQuery = { ...req.query };

    // Create an Array of fields to exclude

    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over removeField and delete them from reqQuery

    removeFields.forEach(params => delete reqQuery[params]);

    console.log(reqQuery);

    //Create query string

    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    console.log(queryStr);

    // Finding resources
    query = model.find(JSON.parse(queryStr));

    // SELECT FIELDS

    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        console.log(fields);
        query = query.select(fields);
    }

    // Sort

    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination 

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate);
    }

    // Executing query

    const results = await query;

    // Pagination result

    const pagination = {};

    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advanceResult = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}


module.exports = advanceResult