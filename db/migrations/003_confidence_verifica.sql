
ALTER TABLE partite ADD COLUMN confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa'));
ALTER TABLE partite ADD COLUMN verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato'));

ALTER TABLE marcatori ADD COLUMN confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa'));
ALTER TABLE marcatori ADD COLUMN verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato'));

ALTER TABLE persone ADD COLUMN confidence TEXT NOT NULL DEFAULT 'media' CHECK (confidence IN ('alta','media','bassa'));
ALTER TABLE persone ADD COLUMN verifica TEXT NOT NULL DEFAULT 'da_verificare' CHECK (verifica IN ('da_verificare','verificato'));
