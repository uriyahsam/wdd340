/* ****************************************
 * Inventory Controller
 **************************************** */

const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

// Build inventory by classification view
async function buildByClassificationId(req, res, next) {
  const classificationId = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classificationId)
  const nameData = await invModel.getClassificationName(classificationId)
  const className = nameData.rows[0]?.classification_name || "Inventory"

  res.render("inventory/classification", {
    title: className,
    grid: utilities.buildClassificationGrid(data.rows),
  })
}

// Build a single inventory item detail view
async function buildByInventoryId(req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  const vehicle = data.rows[0]

  if (!vehicle) {
    return next({ status: 404, message: "Vehicle not found." })
  }

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    detailHtml: utilities.buildVehicleDetail(vehicle),
  })
}

// Intentional error route for Task 3
async function triggerError(req, res, next) {
  throw new Error("Intentional server error (Task 3).")
}

// Task 1: management view
async function buildManagement(req, res) {
  res.render("inventory/management", {
    title: "Inventory Management",
  })
}

// Task 2: deliver add-classification view
async function buildAddClassification(req, res) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    classification_name: "",
  })
}

// Task 2: process add-classification
async function addClassification(req, res) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result.rowCount) {
    // Nav updates automatically because nav is rebuilt on each request
    req.flash("notice", `Success: "${classification_name}" classification added.`)
    return res.redirect("/inv/")
  }

  req.flash("notice", "Error: classification was not added.")
  res.status(500).render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    classification_name,
  })
}

// Task 3: deliver add-inventory view
async function buildAddInventory(req, res) {
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  })
}


// Task 3: process add-inventory
async function addInventory(req, res) {
  const result = await invModel.addInventory(req.body)

  if (result.rowCount) {
    req.flash("notice", "Success: new inventory item added.")
    return res.redirect("/inv/")
  }

  req.flash("notice", "Error: inventory item was not added.")
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  res.status(500).render("inventory/add-inventory", {
    title: "Add Inventory",
    errors: null,
    classificationList,
    ...req.body,
  })
}


module.exports = {
  buildByClassificationId,
  buildByInventoryId,
  triggerError,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory
}
