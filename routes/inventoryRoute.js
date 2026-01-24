/* ****************************************
 * Inventory Routes
 **************************************** */

const express = require("express")
const router = express.Router()

const invController = require("../controllers/invController")
const utilities = require("../utilities")

// View inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View a specific inventory item detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
)

// Intentional error route (Task 3)
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
)

module.exports = router
