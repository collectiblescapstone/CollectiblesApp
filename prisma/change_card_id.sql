UPDATE "Card"
SET id = CONCAT('new_prefix', SUBSTRING(id FROM LENGTH('old_prefix') + 1))
WHERE id LIKE 'old_prefix%';