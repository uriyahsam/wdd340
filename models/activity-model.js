/* ****************************************
 * Activity Log Model
 * Handles all database interaction for the activity_log table.
 **************************************** */

const pool = require("../database")

/* *****************************
 * Add a new activity log entry
 * *************************** */
async function addLog(account_id, action) {
  try {
    const sql = `
      INSERT INTO activity_log (account_id, action)
      VALUES ($1, $2)
      RETURNING *
    `
    return await pool.query(sql, [account_id ?? null, action])
  } catch (error) {
    console.error("Activity log insert error:", error.message)
    return null
  }
}

/* *****************************
 * Get all activity logs (newest first)
 * Includes basic account info (if available)
 * *************************** */
async function getLogs(limit = 200) {
  try {
    const sql = `
      SELECT 
        al.log_id,
        al.action,
        al.log_date,
        a.account_id,
        a.account_firstname,
        a.account_lastname,
        a.account_email,
        a.account_type
      FROM activity_log al
      LEFT JOIN account a
        ON al.account_id = a.account_id
      ORDER BY al.log_date DESC
      LIMIT $1
    `
    return await pool.query(sql, [limit])
  } catch (error) {
    throw error
  }
}

module.exports = { addLog, getLogs }
