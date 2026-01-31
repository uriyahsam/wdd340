const utilities = require("../utilities/")
const activityModel = require("../models/activity-model")

/* ****************************************
 * Deliver Activity Log View
 * *************************************** */
async function buildActivityView(req, res) {
  const nav = await utilities.getNav()
  const data = await activityModel.getLogs()
  res.render("account/activity", {
    title: "Activity Log",
    nav,
    logs: data.rows,
    errors: null,
  })
}

module.exports = { buildActivityView }
