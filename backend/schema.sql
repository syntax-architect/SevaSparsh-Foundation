-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum type for donation status
CREATE TYPE donation_status AS ENUM ('pending', 'successful', 'failed');

-- Create the donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pan_number VARCHAR(10),
    amount NUMERIC(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    status donation_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow the service_role to insert/update
-- This assumes your backend interacts with Supabase using the SERVICE_ROLE_KEY
CREATE POLICY "Allow service role to insert donations" 
ON donations FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Allow service role to update donations" 
ON donations FOR UPDATE 
TO service_role 
USING (true)
WITH CHECK (true);

-- Optional: Allow service role to select
CREATE POLICY "Allow service role to read donations" 
ON donations FOR SELECT 
TO service_role 
USING (true);
