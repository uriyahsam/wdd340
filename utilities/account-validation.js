const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

// Optional alias with correct spelling (helps avoid typos elsewhere)
validate.registrationRules = validate.registationRules

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
  }
  next()
}


/* **********************************
 * Account Update Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = parseInt(req.body.account_id)
        const current = await accountModel.getAccountById(account_id)
        if (!current) {
          throw new Error("Account not found.")
        }
        // Only check for duplicates if email is being changed
        if (account_email !== current.account_email) {
          const existing = await accountModel.checkExistingEmail(account_email)
          if (existing) {
            throw new Error("Email exists. Please use a different email.")
          }
        }
        return true
      }),
  ]
}

/* ******************************
 * Check data and return errors for Account Update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      classificationSelect,
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
    return
  }
  next()
}

/* **********************************
 * Password Update Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors for Password Update
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const account_id = req.body.account_id
    const current = await accountModel.getAccountById(parseInt(account_id))
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      account_id: current?.account_id ?? account_id,
      account_firstname: current?.account_firstname ?? "",
      account_lastname: current?.account_lastname ?? "",
      account_email: current?.account_email ?? "",
    })
    return
  }
  next()
}


module.exports = validate
