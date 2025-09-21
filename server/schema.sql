-- apply on every start; tables are created if they don't exist
pragma journal_mode = wal;
pragma foreign_keys = on;

create table if not exists inventory (
  id text primary key,
  stock integer not null check (stock >= 0)
);

create table if not exists orders (
  order_id integer primary key,
  email text not null,
  address_json text not null,
  items_json text not null,
  created_at datetime not null default current_timestamp
);

create index if not exists idx_orders_created_at on orders(created_at);
