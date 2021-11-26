const pg = require ('pg');

const { Pool } = pg

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

 const getUserWithEmail = (email) => {

  const queryString = `
    SELECT * FROM users
    WHERE email = $1
  ;`;

  return pool
    .query(queryString, [ email ])
    .then((result) => result.rows[0])  //implicit return
    .catch((err) => err.message);
  };

exports.getUserWithEmail = getUserWithEmail;

/// a different way of writing it:
// return pool.query(`
  // SELECT * FROM users
  // WHERE email  = $1
  // `, [email]).then(res => {
  //       console.log(res.rows[0]);
  //       return res.rows[0];
  //   })
  // };

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

 const getUserWithId = (id) => {
  
  const queryString = `
    SELECT * FROM users
    WHERE id = $1
  ;`;

  return pool
    .query(queryString, [ id ])
    .then((result) => result.rows[0])
    .catch((err) => err.message);
  };

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {

  const values = [ user.name, user.email, user.password ];
  const queryString = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *
  ;`;

  return pool
    .query(queryString, values)
    .then(result => {
      //console.log("Success!")
      return result.rows[0];
    })
    .catch((err) => err.message);
  };

exports.addUser = addUser;



/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const values = [guest_id, limit];
  const queryString = `
  SELECT *
  FROM reservations
  JOIN properties ON property_id = properties.id
  WHERE guest_id = $1
  LIMIT $2
  ;`;

  return pool
    .query(queryString, values)
    .then(result => result.rows)
    .catch(err => err.message);

};

exports.getAllReservations = getAllReservations;





/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

// modified the function so it takes a query, needed to connect to the database on top of the file as well 
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
    
      return result.rows
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;





/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
