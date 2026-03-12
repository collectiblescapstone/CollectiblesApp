UPDATE "Card"
SET id = CONCAT('swsh9.1-TG', SUBSTRING(id FROM LENGTH('swsh9-TG') + 1))
WHERE id LIKE 'swsh9-TG%';