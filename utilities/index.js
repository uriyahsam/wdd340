/* ****************************************
 * Utilities
 * - Navigation builder
 * - View HTML builders
 * - Async error wrapper
 **************************************** */

const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Wrap async controller functions so errors are forwarded to Express
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Build the main navigation HTML from the classification table
async function getNav() {
  const data = await invModel.getClassifications()

  let nav = '<nav><ul>'
  nav += '<li><a href="/" title="Home">Home</a></li>'

  data.rows.forEach((row) => {
    nav += `<li><a href="/inv/type/${row.classification_id}" title="View ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })

  nav += "</ul></nav>"
  return nav
}

// Build the HTML grid for the classification view (links to detail route)
function buildClassificationGrid(data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View details for ${vehicle.inv_make} ${vehicle.inv_model}">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </a>
        <div class="namePrice">
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View details for ${vehicle.inv_make} ${vehicle.inv_model}">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${Number(vehicle.inv_price).toLocaleString("en-US")}</span>
        </div>
      </li>
    `
  })
  grid += "</ul>"
  return grid
}

// Build the HTML for a single vehicle detail page
function buildVehicleDetail(vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle details could not be found.</p>'
  }

  const price = `$${Number(vehicle.inv_price).toLocaleString("en-US")}`
  const miles = Number(vehicle.inv_miles).toLocaleString("en-US")

  return `
    <section class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="vehicle-price"><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <h3>Description</h3>
        <p>${vehicle.inv_description}</p>
        <p><a href="/inv/delete/${vehicle.inv_id}" title="Delete ${vehicle.inv_make} ${vehicle.inv_model}">Delete this item</a></p>
      </div>
    </section>
  `
}

async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}


/* ****************************************
 * Middleware to check token validity
 * *************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}



/* ****************************************
 * Check Login
 * ************************************ */
function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = {
  handleErrors,
  getNav,
  buildClassificationGrid,
  buildVehicleDetail,
  buildClassificationList,
  checkJWTToken,
  checkLogin,
}
