module.exports = {
  fileName: function (db) {
    return (db === "" || db === undefined) ? "index.json" : (db.endsWith('.json') ? db : db + '.json')
  },
  setOptions: function(options){
    return (options === undefined) ? {pretty: false, id: false, schema: false} : options
  }
};
