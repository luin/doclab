var Sequelize = require('sequelize');
var config = require('config');
var inflection = require('inflection');
var co =  require('co');

config.database.logging = config.database.log ? console.log : false;
var sequelize = new Sequelize(config.database.name,
                              config.database.user,
                              config.database.pass,
                              config.database);

var models = require('node-require-directory')(__dirname);
Object.keys(models).forEach(function(key) {
  var modelName = inflection.classify(key);
  var modelInstance = sequelize.import(modelName , function(sequelize, DataTypes) {
    var definition = [modelName].concat(models[key](DataTypes));
    if (definition.length >= 3) {
      var funcDefinition = definition[2];
      ['hooks', 'instanceMethods', 'classMethods'].forEach(function(property) {
        var obj = funcDefinition[property];
        if (!obj) {
          return;
        }
        Object.keys(obj).forEach(function(key) {
          if (typeof obj[key] === 'function' && obj[key].constructor && obj[key].constructor.name === 'GeneratorFunction') {
            obj[key] = co.wrap(obj[key]);
          }
        });
      });
    }
    var isMySQL = sequelize.options.dialect === 'mysql';
    DataTypes.LONGTEXT = isMySQL ? 'LONGTEXT' : 'TEXT';
    return sequelize.define.apply(sequelize, definition);
  });
  exports[modelName] = modelInstance;
});

exports.User.belongsToMany(exports.Team, { constraints: false, timestamps: false, through: 'UserTeam' });
exports.Team.belongsToMany(exports.User, { constraints: false, timestamps: false, through: 'UserTeam' });

exports.Project.belongsToMany(exports.Team, { through: exports.ProjectTeam, constraints: false });
exports.Team.belongsToMany(exports.Project, { through: exports.ProjectTeam, constraints: false });

exports.Collection.hasMany(exports.Doc, { constraints: false });
exports.Doc.belongsTo(exports.Collection, { constraints: false });

exports.Project.hasMany(exports.Collection, { constraints: false });
exports.Collection.belongsTo(exports.Project, { constraints: false });

exports.User.hasOne(exports.Doc, { constraints: false });
exports.Doc.belongsTo(exports.User, { constraints: false });


exports.User.hasOne(exports.Session, { constraints: false });
exports.Session.belongsTo(exports.User, { constraints: false });

exports.User.hasOne(exports.News, { constraints: false });
exports.News.belongsTo(exports.User, { constraints: false });

exports.Project.hasOne(exports.News, { constraints: false });
exports.News.belongsTo(exports.Project, { constraints: false });

exports.Collection.hasOne(exports.News, { constraints: false });
exports.News.belongsTo(exports.Collection, { constraints: false });

exports.sequelize = exports.DB = sequelize;
