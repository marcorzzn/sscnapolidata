-- Deterministic dump for table squadre_relazioni (rows: 8)
-- Columns: id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note

INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (1, 267, 269, 'merger', '1922-01-01', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (2, 268, 269, 'merger', '1922-01-01', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (3, 269, 1, 'rename_new_entity', '1926-08-01', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (4, 270, 31, 'merger', '1927-07-22', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (5, 271, 31, 'merger', '1927-07-22', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (6, 272, 31, 'merger', '1927-07-22', 1, 0, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (7, 24, 273, 'rename_new_entity', '1928-08-31', 1, 1, 'manuale', 'media', NULL);
INSERT INTO squadre_relazioni (id, from_squadra_id, to_squadra_id, rel_type, effective_date, inherits_legal, inherits_sporting_record, source, confidence, note) VALUES (8, 273, 24, 'rename_new_entity', '1945-10-27', 1, 1, 'manuale', 'media', NULL);
