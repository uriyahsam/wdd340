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
  const inv_id = parseInt(req.params.inv_id, 10)
  const data = await invModel.getInventoryById(inv_id)
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    classificationSelect,
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


// Build delete confirmation view
async function buildDeleteConfirm(req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  const data = await invModel.getInventoryById(inv_id)
  const vehicle = data.rows[0]

  if (!vehicle) {
    return next({ status: 404, message: "Vehicle not found." })
  }

  res.render("inventory/delete-confirm", {
    title: `Delete ${vehicle.inv_make} ${vehicle.inv_model}`,
    inv_id: vehicle.inv_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_price: vehicle.inv_price,
    errors: null,
  })
}

// Process delete inventory item
async function deleteInventoryItem(req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult && deleteResult.rowCount) {
    req.flash("notice", "Success: inventory item deleted.")
    return res.redirect("/inv/")
  }

  req.flash("notice", "Error: delete failed. Please try again.")
  return res.redirect(`/inv/delete/${inv_id}`)
}


/* ***************************
 * Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  const data = await invModel.getInventoryById(inv_id)
  const itemData = data.rows[0]
  if (!itemData) {
    return next({ status: 404, message: "Inventory item not found." })
  }
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 * Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  }

  req.flash("notice", "Sorry, the update failed.")
  const classificationSelect = await utilities.buildClassificationList(classification_id)
  const itemName = `${inv_make} ${inv_model}`
  return res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  })
}

/* ***************************
 * Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData.rows && invData.rows.length && invData.rows[0].inv_id) {
    return res.json(invData.rows)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = {
  getInventoryJSON,
  buildByClassificationId,
  buildByInventoryId,
  triggerError,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  buildDeleteConfirm,
  deleteInventoryItem,
  editInventoryView,
  updateInventory
}
