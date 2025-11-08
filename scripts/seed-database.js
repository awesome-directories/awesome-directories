var fs = require('fs');
var path = require('path');

function generateSeedSQL() {
    var seedDataPath = path.join(__dirname, '../supabase/seeds/directories.json');
    var seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    var sql = '-- Generated seed data\n';
    sql += 'INSERT INTO directories (\n';
    sql += '  slug, name, url, categories, pricing_type, is_active, description, submission_url, domain_rating, is_dofollow\n';
    sql += ') VALUES\n';
    
    function escapeString(str) {
        if (!str) return '';
        return str.replace(/'/g, "''");
    }
    
    var values = seedData.map(function(item) {
        var slug = escapeString(item.slug || '');
        var name = escapeString(item.name || '');
        var url = escapeString(item.url || '');
        var categories = item.categories ? "'{" + item.categories.map(function(cat) { return escapeString(cat); }).join(',') + "}'" : "'{}'";
        var pricingType = escapeString(item.pricing_type || 'free');
        var isActive = item.is_active !== false;
        var description = escapeString(item.description || '');
        var submissionUrl = escapeString(item.submission_url || item.url || '');
        var domainRating = item.domain_rating ? item.domain_rating : 'NULL';
        var isDofollow = item.is_dofollow === true;
        
        return "  ('" + slug + "', '" + name + "', '" + url + "', " + categories + ", '" + pricingType + "', " + isActive + ", '" + description + "', '" + submissionUrl + "', " + domainRating + ", " + isDofollow + ")";
    });
    
    sql += values.join(',\n');
    sql += '\nON CONFLICT (slug) DO UPDATE SET\n';
    sql += '  name = EXCLUDED.name,\n';
    sql += '  url = EXCLUDED.url,\n';
    sql += '  categories = EXCLUDED.categories,\n';
    sql += '  pricing_type = EXCLUDED.pricing_type,\n';
    sql += '  is_active = EXCLUDED.is_active,\n';
    sql += '  description = EXCLUDED.description,\n';
    sql += '  submission_url = EXCLUDED.submission_url,\n';
    sql += '  domain_rating = EXCLUDED.domain_rating,\n';
    sql += '  is_dofollow = EXCLUDED.is_dofollow,\n';
    sql += '  updated_at = NOW();\n';
    
    return sql;
}

var generatedSQL = generateSeedSQL();
var outputPath = path.join(__dirname, '../supabase/seeds/directories.sql');
fs.writeFileSync(outputPath, generatedSQL);

console.log('Seed SQL generated successfully at:', outputPath);
