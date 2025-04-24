function transformQuery(query) {
  const transformed = {};
  for (const key in query) {
    const match = key.match(/^(.+)\[(.+)\]$/); // Matches keys like 'ratingsAverage[gte]'
    if (match) {
      const field = match[1]; // e.g., 'ratingsAverage'
      const operator = `$${match[2]}`; // e.g., '$gte'
      if (!transformed[field]) {
        transformed[field] = {};
      }
      // Convert to number if possible
      const value = isNaN(query[key]) ? query[key] : Number(query[key]);
      transformed[field][operator] = value;
    } else {
      // Plain key=value (not nested)
      const value = isNaN(query[key]) ? query[key] : Number(query[key]);
      transformed[key] = value;
    }
  }
  return transformed;
}
module.exports = transformQuery;
