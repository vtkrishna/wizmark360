# Phase 2 Production Hardening Backlog

## Email Parser - Full RFC 5322 Compliance

**Priority**: Medium  
**Effort**: 2-3 hours  
**Phase**: 2 (Production Hardening)

### Current Limitation

The email parser handles standard RFC 822 emails but doesn't recognize blank separator lines that contain only whitespace. Per RFC 5322, a line with only spaces/tabs should also be treated as a blank line separating headers from body.

### Required Implementation

Update blank line detection to handle whitespace-only lines:
```typescript
// Find first empty or whitespace-only line
const lines = normalized.split('\n');
let separatorIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '') {
    separatorIndex = i;
    break;
  }
}
```

### Implementation Tasks

1. **Detect whitespace-only separator lines** in addition to empty lines
2. **Update tests** to cover emails with whitespace-only blank lines
3. **Validate folded header handling** works correctly with this change

### Related Files

- `wai-sdk/packages/tools/src/tools/communication/email-parser.ts`

### Acceptance Criteria

- Parses emails with blank lines containing whitespace
- All existing tests continue to pass
- Full RFC 5322 compliance for header/body separation

## Cheerio HTML Parser - Full CSS Selector Support

**Priority**: Medium  
**Effort**: 2-3 hours  
**Phase**: 2 (Production Hardening)

### Current Limitation

The Cheerio parser uses regex-based extraction and only supports tag-name selectors (h1, p, div). It does not support:
- Class selectors (.class-name)
- ID selectors (#element-id)
- Attribute selectors ([attr=value])
- Descendant/child selectors (div > p, .parent .child)
- Pseudo-selectors (:first-child, :nth-of-type, etc.)

### Required Implementation

Install and integrate actual Cheerio library for full jQuery-like CSS selector support:
```typescript
import * as cheerio from 'cheerio';

const $ = cheerio.load(html);
const text = $(selector).text();
const elements = $(selector).map((i, el) => $(el).text()).get();
```

### Implementation Tasks

1. **Add cheerio dependency**: `npm install cheerio`
2. **Replace regex helpers** with Cheerio API calls
3. **Update tests** to cover class/ID/attribute selectors
4. **Validate table parsing** with complex selectors like `table.data-table`

### Related Files

- `wai-sdk/packages/tools/src/tools/web-scraping/cheerio-parser.ts`

### Acceptance Criteria

- Supports all standard CSS selectors
- Table parsing works with class/ID selectors
- All existing tests continue to pass
- No regex-based extraction remaining

## A/B Testing Tool - Exact Student's t Distribution

**Priority**: High  
**Effort**: 4-6 hours  
**Phase**: 2 (Production Hardening)

### Current Limitation

The t-test currently uses Wallace's approximation for df >= 3 and a conservative normal approximation for df < 3. This is accurate enough for most use cases but not exact for small sample sizes.

### Required Implementation

Implement exact Student's t CDF using incomplete beta function:
- Use Lentz's method for continued fraction evaluation
- Implement incomplete beta function I_x(a, b) correctly
- Validate against authoritative references (SciPy, R)

### Implementation Tasks

1. **Implement Lentz's continued fraction algorithm**:
   - Proper integer loop variable handling
   - Numerical stability safeguards
   - Convergence criteria (epsilon < 1e-10)

2. **Implement incomplete beta function**:
   - Use relationship: Student's t CDF = 1 - 0.5 * I_x(df/2, 0.5)
   - Where x = df / (df + t²)

3. **Add regression tests**:
   - Compare against SciPy/R for df = [1, 2, 3, 5, 10, 20, 30]
   - Test t-statistics = [-3, -2, -1, 0, 1, 2, 3]
   - Ensure p-value accuracy within 0.001

### Related Files

- `wai-sdk/packages/tools/src/tools/statistics/ab-testing.ts`

### Acceptance Criteria

- Exact t-distribution CDF for all df >= 1
- P-values match SciPy within 0.001 tolerance
- All existing tests continue to pass
- No numerical instability (NaN, Inf)

### References

- Lentz, W.J. (1976). "Generating Bessel functions in Mie scattering calculations using continued fractions"
- Abramowitz & Stegun (1972). "Handbook of Mathematical Functions"
- Press et al. (2007). "Numerical Recipes"

## Pivot Table Tool - Hierarchical Multi-Column Support

**Priority**: Medium  
**Effort**: 2-3 hours  
**Phase**: 2 (Production Hardening)

### Current Limitation

The pivot table tool currently flattens multi-column dimensions into single keys:
```javascript
// Current output with columns: ['region', 'quarter']
{
  East: { "North|Q1": 100, "North|Q2": 150 }
}
```

### Required Implementation

Support hierarchical column structures:
```javascript
// Desired output
{
  East: { 
    North: { Q1: 100, Q2: 150 },
    South: { Q1: 200, Q2: 250 }
  }
}
```

### Implementation Tasks

1. **Recursive column tree building**:
   - Parse column dimensions into hierarchical structure
   - Build nested objects dynamically
   - Cache intermediate nodes to avoid duplication

2. **Aggregation updates**:
   - Apply aggregation at leaf nodes only
   - Preserve intermediate column groupings
   - Handle fill values at all levels

3. **Comprehensive testing**:
   - Single-column pivots (existing)
   - Multi-column hierarchical pivots (new)
   - Mixed single/multi-value aggregations (new)
   - Edge cases (empty columns, null values)

### Related Files

- `wai-sdk/packages/tools/src/tools/data/pivot-table.ts`

### Acceptance Criteria

- Multi-column dimensions return nested objects
- Single-column dimensions remain unchanged (backward compatibility)
- All existing tests continue to pass
- New tests cover 2-level and 3-level column hierarchies
