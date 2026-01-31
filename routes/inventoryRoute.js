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
router.get(
  "/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement))

// Return inventory by classification as JSON (AJAX)
router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Step 1: Edit inventory view (deliver form pre-filled)
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
)

// Step 2: Process inventory update
router.post(
  "/update",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Task 2: add classification
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Task 3: add inventory
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)


// Delete inventory item (confirm view)
router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Process inventory delete
router.post(
  "/delete",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
