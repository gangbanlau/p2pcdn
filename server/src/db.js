/**
 * Database functionality.
 */

var Sequelize = require('sequelize');
var db = {};


/**
 * Initializes the database connection and return the
 * sequelize object.
 */
var initDB = function(databaseConfig) {
    var sequelize;
    if(databaseConfig.type == 'sqlite') {
        sequelize = new Sequelize('database', 'user', 'password',
            {
                storage: databaseConfig.path,
                dialect: 'sqlite'
            }
        );
    } else if (databaseConfig.type == 'mysql') {
        sequelize = new Sequelize(
            databaseConfig.database,
            databaseConfig.user,
            databaseConfig.password,
            {
                host: databaseConfig.host,
                port: databaseConfig.port,
                type: 'mysql'
            }
        )
    }
    return sequelize;
};

var defineTables = function(sequelize) {
    db.File = sequelize.define('file', {
        uuid: {
            primaryKey: true,
            type: Sequelize.STRING,
            field: 'UUID'
        },
        fileName: {
            type: Sequelize.STRING,
            field: 'file_name'
        }
    });
};

/**
 * Database initialization.
 *
 * @param {Database} databaseConfig
 */
var init = exports.init = function(databaseConfig) {
    var sequelize = initDB(databaseConfig);
    db.sequelize = sequelize;

    defineTables(sequelize);
};
/**
 * Creates all tables. Returns a promise which gets resolved
 * then the whole database is synced.
 */
var sync = exports.sync = function() {
    return db.File.sync();
};
exports.db = db;