const fs = require("fs");

module.exports = {
  create: function (fileName) {
    try {
      fs.writeFileSync(fileName, JSON.stringify([]));
    } catch (error) {
      console.error(error);
    }
  },
  exists: function(fileName){
    try{
      return fs.existsSync(fileName) ? true : false
    }catch(error){
      console.error(error)
    }
  },

  write: function (fileName, data) {
    try {
      fs.writeFileSync(fileName, data);
    } catch (error) {
      console.error(error)
    }
  },
  read: function(fileName){
    try{
      return JSON.parse(fs.readFileSync(fileName))
    }catch(error){
      console.error(error)
    }
  },
  delete: function(fileName){

    try{
      fs.unlinkSync(fileName)
    }catch(error){
      console.error(error)
    }
  },
  size: function(fileName){
    try{
      return fs.statSync(fileName).size
    }catch(error){
      console.error(error)
    }
  },
  copy: function(fileName, newFileName){
    try{
      fs.copyFileSync(fileName, newFileName)
    }catch(error){
      console.error(error)
    }
  },
  rename: function(fileName, newFileName){
    try{
      fs.renameSync(fileName, newFileName)
    }catch(error){
      console.error(error)
    }
  }
};
