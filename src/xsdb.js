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
  if (!this._.isPlainObject(data)) {
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
  if (!this._.isArray(data)) {
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

xsDB.prototype.findOne = function (filter) {
  let objects = this._.filter(this.data, filter);
  if (!objects.length) {
    console.error("Error. No object found.");
    return;
  } else if (objects.length > 1) {
    console.error("Error. The key has to be unique.");
    return;
  }
  return this._.find(this.data, filter);
};

xsDB.prototype.findMany = function (filter) {
  let objects =
    filter === {} || filter === undefined
      ? this.data
      : this._.filter(this.data, filter);
  if (!objects.length) {
    console.error("Error. No object found.");
    return;
  }
  return objects;
};

xsDB.prototype.updateOne = function (filter, data) {
  let object = this.findOne(filter);
  if (!object) return;
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

xsDB.prototype.updateMany = function (filter, data) {
  let objects = this.findMany(filter);
  if (!objects) return;
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

xsDB.prototype.deleteOne = function (filter) {
  let object = this.findOne(filter);
  if (!object) return;
  this._.pull(this.data, object);
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

xsDB.prototype.deleteMany = function (filter) {
  let objects = this.findMany(filter);
  if (!objects) return;
  objects.forEach((object) => {
    this._.pull(this.data, object);
  });
  this.options.pretty
    ? file.write(this.db, JSON.stringify(this.data, null, 2))
    : file.write(this.db, JSON.stringify(this.data));
  return this.data;
};

xsDB.prototype.encryptOne = function (filter, fields, encKey) {
  let object = this.findOne(filter);
  if (!object) return;
  if (this._.isArray(fields)) {
    fields.forEach((field) => {
      let value = this._.pickBy(object, (value, key) =>
        this._.startsWith(key, field)
      );
      value[field] = crypto.encrypt(value[field], encKey);
      this._.assign(object, value);
    });
  } else {
    let value = this._.pickBy(object, (value, key) =>
      this._.startsWith(key, fields)
    );
    value[fields] = crypto.encrypt(value[field], encKey);
    this._.assign(object, value);
  }
  this.set();
  return this.data;
};

xsDB.prototype.decryptOne = function (key, fields, decKey) {
  let object = this.findOne(key);
  if (!object) return;
  if (this._.isArray(fields)) {
    fields.forEach((field) => {
      let value = this._.pickBy(object, (value, key) =>
        this._.startsWith(key, field)
      );
      value[field] = crypto.decrypt(value[field], decKey);
      this._.assign(object, value);
    });
  } else {
    let value = this._.pickBy(object, (value, key) =>
      this._.startsWith(key, fields)
    );
    value[fields] = crypto.decrypt(value[fields], decKey);
    this._.assign(object, value);
  }
  this.set();
  return this.data;
};

xsDB.prototype.encryptMany = function (filter, fields, encKey) {
  let objects = this.findMany(filter);
  if (!objects) return;
  if (this._.isArray(fields)) {
    objects.forEach((object) => {
      fields.forEach((field) => {
        let value = this._.pickBy(object, (value, key) =>
          this._.startsWith(key, field)
        );
        value[field] = crypto.encrypt(value[field], encKey);
        this._.assign(object, value);
      });
    });
  } else {
    objects.forEach((object) => {
      let value = this._.pickBy(object, (value, key) =>
        this._.startsWith(key, fields)
      );
      value[fields] = crypto.encrypt(value[field], encKey);
      this._.assign(object, value);
    });
  }
  this.set();
  return this.data;
};

xsDB.prototype.decryptMany = function (filter, fields, decKey) {
  let objects = this.findMany(filter);
  if (!objects) return;
  if (this._.isArray(fields)) {
    objects.forEach((object) => {
      fields.forEach((field) => {
        let value = this._.pickBy(object, (value, key) =>
          this._.startsWith(key, field)
        );
        value[field] = crypto.decrypt(value[field], decKey);
        this._.assign(object, value);
      });
    });
  } else {
    objects.forEach((object) => {
      let value = this._.pickBy(object, (value, key) =>
        this._.startsWith(key, fields)
      );
      value[fields] = crypto.decrypt(value[field], decKey);
      this._.assign(object, value);
    });
  }
  this.set();
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

xsDB.prototype.newSchema = function (schm) {
  if (!this._.isPlainObject(schm)) {
    console.error("Error. A object is expected.");
    return;
  }
  this.options.schema = schema(schm);
};

//CREATE DB
function newDB(options) {
  return new xsDB(options);
}

module.exports = newDB;

let xs = newDB();

xs.decryptMany({age: 22}, ["email", "password"], "1234")
