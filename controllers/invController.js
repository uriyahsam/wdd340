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

module.exports = {
  buildByClassificationId,
  buildByInventoryId,
  triggerError,
}
