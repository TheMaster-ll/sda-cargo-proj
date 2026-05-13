-- CargoPort Foreign Key Constraints
-- Run this if constraints are ever missing: psql or Supabase SQL Editor
-- Safe to re-run — uses IF NOT EXISTS / DROP IF EXISTS pattern

-- Users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_usertypeid_fkey;
ALTER TABLE users ADD CONSTRAINT users_usertypeid_fkey FOREIGN KEY (usertypeid) REFERENCES usertypes(usertypeid);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_companyid_fkey;
ALTER TABLE users ADD CONSTRAINT users_companyid_fkey FOREIGN KEY (companyid) REFERENCES companies(companyid);

-- Orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_pickuploc;
ALTER TABLE orders ADD CONSTRAINT fk_orders_pickuploc FOREIGN KEY (pickuplocationid) REFERENCES locations(locationid);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_delivloc;
ALTER TABLE orders ADD CONSTRAINT fk_orders_delivloc FOREIGN KEY (deliverylocationid) REFERENCES locations(locationid);

-- Shipments
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_orderid_fkey;
ALTER TABLE shipments ADD CONSTRAINT shipments_orderid_fkey FOREIGN KEY (orderid) REFERENCES orders(orderid);

-- Rates
ALTER TABLE rates DROP CONSTRAINT IF EXISTS fk_rates_originloc;
ALTER TABLE rates ADD CONSTRAINT fk_rates_originloc FOREIGN KEY (originlocationid) REFERENCES locations(locationid);

ALTER TABLE rates DROP CONSTRAINT IF EXISTS fk_rates_destloc;
ALTER TABLE rates ADD CONSTRAINT fk_rates_destloc FOREIGN KEY (destinationlocationid) REFERENCES locations(locationid);

-- Audit Log
ALTER TABLE auditlog DROP CONSTRAINT IF EXISTS auditlog_userid_fkey;
ALTER TABLE auditlog ADD CONSTRAINT auditlog_userid_fkey FOREIGN KEY (userid) REFERENCES users(userid);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
