/**
 * Removes the "- (Simple Product)" suffix from product names
 * @param {string} name - The product name
 * @returns {string} - The cleaned product name
 */
export function cleanProductName(name) {
    if (!name) return '';
    return name.replace(/\s*-\s*\(Simple Product\)\s*$/i, '').trim();
}
