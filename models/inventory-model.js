/* ****************************************
 * Inventory Model
 * Handles all database interaction for inventory/classifications.
 **************************************** */

const pool = require("../database")

// Get all classifications (for navigation)
async function getClassifications() {
  return pool.query(
    "SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name"
  )
}

// Get inventory items for a given classification id (parameterized)
async function getInventoryByClassificationId(classification_id) {
  const sql =
    "SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id FROM public.inventory WHERE classification_id = $1 ORDER BY inv_make"
  return pool.query(sql, [classification_id])
}

// Get a single inventory item by inventory id (parameterized)
async function getInventoryById(inv_id) {
  const sql =
    "SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id FROM public.inventory WHERE inv_id = $1"
  return pool.query(sql, [inv_id])
}

// Get classification name by id
async function getClassificationName(classification_id) {
  const sql =
    "SELECT classification_name FROM public.classification WHERE classification_id = $1"
  return pool.query(sql, [classification_id])
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  getClassificationName,
}
