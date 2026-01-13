#!/usr/bin/env node

/**
 * Finance Database Setup Script
 *
 * This script helps set up the finance tables and views for the EEAM application.
 * Run this script in your Supabase SQL editor or database console.
 */

console.log(`
EEAM Finance Database Setup
============================

Copy and paste the following SQL into your Supabase SQL Editor:

${require('fs').readFileSync('./supabase/finance.sql', 'utf8')}

After running the SQL, your finance dashboard will have sample data and full functionality.

Note: This script creates:
- transactions_financieres table
- budgets table
- vue_finance_resume view
- vue_depenses_par_categorie view
- Sample data for testing

The application will work without this setup, but the finance page will show empty data.
`);