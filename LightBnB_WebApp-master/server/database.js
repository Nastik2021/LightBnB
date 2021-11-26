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


const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1 
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += ` AND city LIKE $${queryParams.length} `;
  }

  //if an owner is passed
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += ` AND owner_id = $${queryParams.length}`;
  }

  //if passing minimum price
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`*100);
    queryString += ` AND cost_per_night >= $${queryParams.length}`;
  }

  //if passing maximum price
  if (options.maximum_price_per_night) {
      queryParams.push(`${options.maximum_price_per_night}`*100);
      queryString += ` AND cost_per_night <= $${queryParams.length}`;
  }

  //passing the rating
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` AND rating >= $${queryParams.length}`;
  }


  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  //console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
  .then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;





/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  let queryString = `
  INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *
  ;`

  let values = [property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night * 100,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms]

  return pool
    .query(queryString, values)
    .then(res => res.rows)
    .catch(err => console.error(err.message));
 
};

exports.addProperty = addProperty;
