-- Activity Log enhancement (Task 22)
-- Run this in your PostgreSQL database

CREATE TABLE IF NOT EXISTS activity_log (
  log_id SERIAL PRIMARY KEY,
  account_id INT REFERENCES account(account_id),
  action TEXT NOT NULL,
  log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
