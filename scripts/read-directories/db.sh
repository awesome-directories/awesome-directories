DSN=$1

# schema only
pg_dump "$DSN" --schema-only --no-owner --no-privileges --no-comments --no-tablespaces --no-unlogged-table-data --file schema.sql

# data only
pg_dump "$DSN" --data-only --no-owner --no-privileges --no-comments --no-tablespaces --no-unlogged-table-data --file data.sql
