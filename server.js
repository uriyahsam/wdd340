/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const bodyParser = require("body-parser")
const app = express()
const static = require("./routes/static")
const session = require("express-session")
const flash = require("connect-flash")
const baseController = require("./controllers/baseController")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const cookieParser = require("cookie-parser")



// Utilities (navigation + error handling helpers)
const utilities = require("./utilities")

// Route modules
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Middleware
 *************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser()) // Needed for JWT-in-cookie auth

app.use(utilities.checkJWTToken) // Validate JWT token (if present) on every request

app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
)

// Express Messages Middleware
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})


// Build the navigation for every view.
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
  } catch (err) {
    console.error("NAV DB ERROR:", err) // show the real error
    res.locals.nav = '<nav><ul><li><a href="/">Home</a></li></ul></nav>'
  }
  next()
})



/* ***********************
 * Routes
 *************************/
app.use(static)

// Inventory routes
app.use("/inv", inventoryRoute)

// Account route
app.use("/account", accountRoute)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))


/* ***********************
 * 404 Handler
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we couldn't find that page." })
})

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const status = err.status || 500
  const title = status === 404 ? "404 Not Found" : "Server Error"
  const nav = res.locals.nav || (await utilities.getNav().catch(() => ""))

  res.status(status).render("errors/error", {
    title,
    nav,
    status,
    message: err.message || "An unexpected error occurred.",
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
