const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountModel = require("../models/account-model")

/* ****************************************
* Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
* Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
* Process Registration
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } =
    req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    )
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult && regResult.rows && regResult.rows.length) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
}


/* ****************************************
 * Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 } // seconds
      )

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000, // 1 hour in ms
      }
      if (process.env.NODE_ENV !== "development") {
        cookieOptions.secure = true
      }

      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}


/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildUpdateAccount(req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
 * Process account update
 * *************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    parseInt(account_id)
  )

  if (updateResult && updateResult.account_id) {
    // Re-issue JWT so updated name/email are reflected immediately
    const tokenPayload = { ...updateResult }
    delete tokenPayload.account_password
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    )
    const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
    if (process.env.NODE_ENV !== "development") cookieOptions.secure = true
    res.cookie("jwt", accessToken, cookieOptions)

    res.locals.accountData = tokenPayload
    res.locals.loggedin = 1

    req.flash("notice", "Account information updated successfully.")
    res.render("account/account", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 * Process password change
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(hashedPassword, parseInt(account_id))

    if (updateResult && updateResult.account_id) {
      req.flash("notice", "Password updated successfully.")
      res.render("account/account", {
        title: "Account Management",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the password update failed.")
      res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
        account_firstname: res.locals.accountData?.account_firstname ?? "",
        account_lastname: res.locals.accountData?.account_lastname ?? "",
        account_email: res.locals.accountData?.account_email ?? "",
      })
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.")
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname: res.locals.accountData?.account_firstname ?? "",
      account_lastname: res.locals.accountData?.account_lastname ?? "",
      account_email: res.locals.accountData?.account_email ?? "",
    })
  }
}

/* ****************************************
 * Logout process
 * *************************************** */
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}


module.exports = { buildLogin, buildRegister, registerAccount, buildAccountManagement, accountLogin,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  accountLogout}
