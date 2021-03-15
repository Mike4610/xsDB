module.exports = {
  fileName: function (db) {
    return (db === "" || db === undefined) ? "index.json" : (db.endsWith('.json') ? db : db + '.json')
  }
};
