const file = require("./file");
const utils = require("./utils");
const crypto = require("./crypto");
const _ = require("lodash");
const id = require("shortid");
const schema = require("schm");

//INITIALIZE DATABASE
function xsDB(options) {
  this.options = utils.setOptions(options);
  this.db = utils.fileName(this.options.name);
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
  if (this.options.schema) this.newSchema(this.options.schema);
};

//READ/WRITE METHODS
xsDB.prototype.set = function () {
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
};

//COLLECTION METHODS
xsDB.prototype.insertOne = async function (data) {
  if (!_.isPlainObject(data)) {
    console.error("Error. An object is expected.");
    return;
  } else {
    if (this.options.schema) {
      try {
        await this.options.schema.validate(data);
      } catch (error) {
        console.error("Error. Make sure all fields are correct.");
        return;
      }
    }
    this.options.id
      ? this.data.push(this._.assign({ id: id.generate() }, data))
      : this.data.push(data);
    this.set();
    return this.data;
  }
};

xsDB.prototype.insertMany = async function (data) {
  if (!_.isArray(data)) {
    console.error("Error. An array is expected.");
    return;
  } else {
    if (this.options.schema) {
      try {
        await this.options.schema.validate(data);
      } catch (error) {
        console.error("Error. Make sure all fields are complete.");
        return;
      }
    }
    this.options.id
      ? data.forEach((value) => {
          this.data.push(this._.assign({ id: id.generate() }, value));
        })
      : this.data.push(...data);
    this.set();
    return this.data;
  }
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

xsDB.prototype.count = function () {
  let count = 0;
  this.data.forEach((obj) => {
    count++;
  });
  return count;
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

xsDB.prototype.encryptOne = function (key, field, encKey) {
  let obj = this.findOne(key);
  console.log(obj);
  let a = _.pickBy(obj, (key) => key.startsWith(field));
  console.log(a);
  let enc = crypto.encrypt(Object.values(a)[0], encKey);
  value[field] = enc;
  this._.assign(obj, value);
  this.set();
  return this.data;
};

xsDB.prototype.decryptOne = function (field, key) {};

xsDB.prototype.newSchema = function (schm) {
  this.options.schema = schema(schm);
};

//CREATE DB
function newDB(options) {
  return new xsDB(options);
}

module.exports = newDB;

let xs = newDB();
xs.insertOne({
  name: "Micael",
  email: "mike22vieiraa",
  password: "inteligente",
});
xs.encryptOne({ name: "Micael" }, "password", "1234");
