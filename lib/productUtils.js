export function cleanProductName(name) {
    if (!name) return '';
    return name.replace(/\s*-\s*\([^)]*\)\s*$/i, '').trim();
}
