const { body, validationResult } = require("express-validator")
const utilities = require(".") // utilities/index.js

const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed."),
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Please correct the errors below.")
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      errors: errors.array(),
      classification_name: req.body.classification_name,
    })
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").trim().isInt({ min: 1900, max: 2099 }).withMessage("Year must be valid."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").trim().isFloat({ min: 0 }).withMessage("Price must be a number."),
    body("inv_miles").trim().isInt({ min: 0 }).withMessage("Miles must be a whole number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").trim().notEmpty().withMessage("Choose a classification."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  if (!errors.isEmpty()) {
    req.flash("notice", "Please correct the errors below.")
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: errors.array(),
      classificationList,
      ...req.body, // to makes the form sticky
    })
  }
  next()
}

module.exports = validate
