const file = require("./file");
const utils = require("./utils");
var _ = require("lodash");
const id = require("shortid");

//INITIALIZE DATABASE
function xsDB(options) {
  this.db = utils.fileName(options.name);
  this.options = options;
  this._ = _;
  this.init();
}

xsDB.prototype.init = function () {
  if (file.exists(this.db)) {
    this.data = file.read(this.db);
  } else {
    file.create(this.db);
    this.data = [];
  }
};

//COLLECTION METHODS
xsDB.prototype.insertOne = function (data) {
  if (this.options.pretty) {
    this.options.id
      ? this.data.push(this._.assign({ id: id.generate() }, data))
      : this.data.push(data);
    file.write(this.db, JSON.stringify(this.data, null, 2));
  } else {
    this.options.id
      ? this.data.push(this._.assign({ id: id.generate() }, data))
      : this.data.push(data);
    file.write(this.db, JSON.stringify(this.data));
  }
  return this.data;
};

xsDB.prototype.insertMany = function (data) {
  if (!_.isArray(data)) {
    console.error("Error. An array is expected.");
    return;
  } else {
    if (this.options.pretty) {
      this.options.id
        ? data.forEach((value) => {
            this.data.push(this._.assign({ id: id.generate() }, value));
          })
        : this._.union(this.data, data);
      file.write(this.db, JSON.stringify(this.data, null, 2));
    } else {
      this.options.id
        ? data.forEach((value) => {
            this.data.push(this._.assign({ id: id.generate() }, value));
          })
        : this._.union(this.data, data);
      file.write(this.db, JSON.stringify(this.data));
    }
  }
  return this.data;
};

xsDB.prototype.findOne = function (key) {
  let objects = this._.filter(this.data, key);
  if (objects.length === 0) {
    console.error("Error. No object found.");
    return;
  } else if (objects.length > 1) {
    console.error("Error. The key has to be unique.");
    return;
  }
  return this._.find(this.data, key);
};

xsDB.prototype.findMany = function (key) {
  return key === {} || key === undefined
    ? this.data
    : this._.filter(this.data, key);
};

xsDB.prototype.updateOne = function (key, data) {
  let object = this.findOne(key);
  _.isArray(data)
    ? data.forEach((value) => {
        this._.set(object, Object.keys(value), Object.values(value)[0]);
      })
    : this._.set(object, Object.keys(data), Object.values(data)[0]);
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

xsDB.prototype.updateMany = function (key, data) {
  let objects = this.findMany(key);
  objects.forEach((object) => {
    _.isArray(data)
      ? data.forEach((value) => {
          this._.set(object, Object.keys(value), Object.values(value)[0]);
        })
      : this._.set(object, Object.keys(data), Object.values(data)[0]);
  });
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

xsDB.prototype.deleteOne = function (key) {
  let object = this.findOne(key);
  this._.pull(this.data, object);
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

xsDB.prototype.deleteMany = function (key) {
  let objects = this.findMany(key);
  objects.forEach((object) => {
    this._.pull(this.data, object);
  });
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

//ADITIONAL COLLECTION METHODS
xsDB.prototype.drop = function () {
  file.delete(this.db);
};

xsDB.prototype.dataSize = function () {
  return file.size(this.db);
};

xsDB.prototype.copyTo = function (fileName) {
  let newdb = utils.fileName(fileName);
  file.copy(this.db, newdb);
};

xsDB.prototype.rename = function (fileName) {
  let newdbname = utils.fileName(fileName);
  file.rename(this.db, newdbname);
  this.db = newdbname;
};

let options = {
  name: "persons.json",
  pretty: true,
  id: true,
};

let xs = new xsDB(options);


