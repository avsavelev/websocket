module.exports = function mapMessage(message) {
  const {id, user, date, text} = message;
  return {id, user, date, text};
};
