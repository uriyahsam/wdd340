/* ****************************************
 * Utilities
 * - Navigation builder
 * - View HTML builders
 * - Async error wrapper
 **************************************** */

const invModel = require("../models/inventory-model")

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


module.exports = {
  handleErrors,
  getNav,
  buildClassificationGrid,
  buildVehicleDetail,
  buildClassificationList,
}
