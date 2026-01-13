-- Finance Tables and Views for EEAM Church Management System

-- Create transactions_financieres table
CREATE TABLE IF NOT EXISTS transactions_financieres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_transaction DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    categorie TEXT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenu', 'depense')),
    source TEXT,
    vendeur TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categorie TEXT NOT NULL,
    montant_alloue DECIMAL(10,2) NOT NULL,
    annee INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(categorie, annee)
);

-- Insert sample budget data
INSERT INTO budgets (categorie, montant_alloue, annee) VALUES
('Dîmes', 50000.00, 2024),
('Offrandes', 30000.00, 2024),
('Activités', 25000.00, 2024),
('Maintenance', 20000.00, 2024),
('Personnel', 40000.00, 2024)
ON CONFLICT (categorie, annee) DO NOTHING;

-- Insert sample transaction data
INSERT INTO transactions_financieres (date_transaction, description, categorie, montant, type, source, vendeur) VALUES
(CURRENT_DATE, 'Dîme mensuelle - Jean Dupont', 'Dîmes', 500.00, 'revenu', 'Trésorerie', NULL),
(CURRENT_DATE - INTERVAL '1 day', 'Offrande spéciale', 'Offrandes', 200.00, 'revenu', 'Culte dominical', NULL),
(CURRENT_DATE - INTERVAL '2 days', 'Achat de matériel son', 'Maintenance', 1500.00, 'depense', NULL, 'Sonorisation Plus'),
(CURRENT_DATE - INTERVAL '3 days', 'Sortie jeunes', 'Activités', 300.00, 'depense', NULL, 'Centre Jeunes'),
(CURRENT_DATE - INTERVAL '4 days', 'Salaire pasteur', 'Personnel', 2000.00, 'depense', NULL, 'Banque'),
(CURRENT_DATE - INTERVAL '5 days', 'Dîme - Marie Martin', 'Dîmes', 300.00, 'revenu', 'Trésorerie', NULL)
ON CONFLICT DO NOTHING;

-- Create view for finance summary
CREATE OR REPLACE VIEW vue_finance_resume AS
SELECT
    COALESCE(SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END), 0) as total_revenus,
    COALESCE(SUM(CASE WHEN type = 'depense' THEN montant ELSE 0 END), 0) as total_depenses,
    COALESCE(SUM(CASE WHEN type = 'revenu' THEN montant ELSE -montant END), 0) as solde_net,
    COALESCE(SUM(CASE WHEN categorie = 'Dîmes' AND type = 'revenu' THEN montant ELSE 0 END), 0) as total_dimes
FROM transactions_financieres;

-- Create view for expenses by category
CREATE OR REPLACE VIEW vue_depenses_par_categorie AS
SELECT
    b.categorie,
    b.montant_alloue,
    COALESCE(SUM(CASE WHEN tf.type = 'depense' THEN tf.montant ELSE 0 END), 0) as total_depense
FROM budgets b
LEFT JOIN transactions_financieres tf ON b.categorie = tf.categorie AND EXTRACT(YEAR FROM tf.date_transaction) = b.annee
WHERE b.annee = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY b.categorie, b.montant_alloue
ORDER BY b.categorie;

-- Enable Row Level Security
ALTER TABLE transactions_financieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions_financieres
CREATE POLICY "Allow all operations for authenticated users" ON transactions_financieres
FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for budgets
CREATE POLICY "Allow all operations for authenticated users" ON budgets
FOR ALL USING (auth.role() = 'authenticated');