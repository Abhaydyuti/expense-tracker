// middlewares/sanitize.js
// Light sanitization helpers used across controllers.
// We trim strings and enforce safe types.
// Note: EJS's <%= %> already HTML-escapes output,
// so we only need to worry about what goes INTO the database.

const sanitizeString = (val, maxLen = 255) => {
  if (!val) return null;
  return String(val).trim().substring(0, maxLen);
};

const sanitizeAmount = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? null : Math.round(num * 100) / 100; // round to 2dp
};

const sanitizeInt = (val) => {
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

const sanitizeDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : val;
};

module.exports = {
  sanitizeString,
  sanitizeAmount,
  sanitizeInt,
  sanitizeDate
};