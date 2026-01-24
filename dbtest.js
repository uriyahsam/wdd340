require("dotenv").config()
const pool = require("./database")

;(async () => {
  try {
    const res = await pool.query("SELECT NOW()")
    console.log("DB OK:", res.rows[0])
    process.exit(0)
  } catch (e) {
    console.error("DB FAIL:", e.message)
    process.exit(1)
  }
})()
