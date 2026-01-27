/* ****************************************
 * Inventory Routes
 **************************************** */

const express = require("express")
const router = express.Router()

const invValidate = require("../utilities/inventory-validation")
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

// Task 1: management
router.get("/", utilities.handleErrors(invController.buildManagement))

// Task 2: add classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Task 3: add inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
