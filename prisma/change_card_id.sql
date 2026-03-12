UPDATE "Card"
SET id = CONCAT('swsh9.1-TG', SUBSTRING(id FROM LENGTH('swsh9-TG') + 1))
WHERE id LIKE 'swsh9-TG%';

/*
swsh9-TG -> swsh9.1-TG
swsh12-TG -> swsh12.1-TG
swsh12.5-GG -> swsh12.5.1-GG
*/