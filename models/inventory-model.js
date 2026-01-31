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

async function addClassification(classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
  return pool.query(sql, [classification_name])
}

async function addInventory(data) {
  const sql = `
    INSERT INTO inventory
    (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
     inv_price, inv_miles, inv_color, classification_id)
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`

  const params = [
    data.inv_make,
    data.inv_model,
    data.inv_year,
    data.inv_description,
    data.inv_image,
    data.inv_thumbnail,
    data.inv_price,
    data.inv_miles,
    data.inv_color,
    data.classification_id,
  ]

  return pool.query(sql, params)
}


/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    throw new Error("Delete Inventory Error")
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  getClassificationName,
  addClassification,
  addInventory,
  deleteInventoryItem,
}
