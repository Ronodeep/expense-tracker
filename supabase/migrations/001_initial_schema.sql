-- Expense Tracker — Initial Schema
-- Module 1: Split Expenses (SplitKaro)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Groups
create table groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  default_currency text not null default 'INR',
  conversion_rate float not null default 1.0,
  created_at timestamptz not null default now()
);

-- Members (name-based identity, no auth)
create table members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  is_creator boolean not null default false,
  joined_at timestamptz not null default now(),
  unique(group_id, name)
);

-- Categories (predefined + custom per group)
create table categories (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade,
  name text not null,
  is_predefined boolean not null default false
);

-- Seed predefined categories
insert into categories (name, is_predefined) values
  ('Food', true),
  ('Transport', true),
  ('Accommodation', true),
  ('Shopping', true),
  ('Entertainment', true),
  ('Tickets', true),
  ('Miscellaneous', true);

-- Expenses
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  description text not null,
  total_amount float not null,
  currency text not null default 'INR',
  conversion_rate float not null default 1.0,
  category_id uuid references categories(id),
  expense_date date not null default current_date,
  created_by uuid references members(id),
  split_type text not null default 'EQUAL' check (split_type in ('EQUAL', 'RATIO', 'PERCENTAGE', 'EXACT')),
  created_at timestamptz not null default now()
);

-- Who paid for an expense (supports multiple payers)
create table expense_payers (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  amount_paid float not null
);

-- How an expense is split among members
create table expense_splits (
  id uuid primary key default uuid_generate_v4(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  split_value float not null default 1,
  amount_owed float not null
);

-- Indexes for performance
create index idx_members_group on members(group_id);
create index idx_expenses_group on expenses(group_id);
create index idx_expense_payers_expense on expense_payers(expense_id);
create index idx_expense_splits_expense on expense_splits(expense_id);
