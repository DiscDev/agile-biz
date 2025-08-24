---
allowed-tools: [Task]
argument-hint: Describe what was learned or insights gained from the project
---

# Capture Learnings

Document insights, lessons learned, and best practices discovered during project development for future reference and community contribution.

## Usage

```
/capture-learnings [learning description or topic]
```

**Examples:**
- `/capture-learnings React performance optimization using useMemo`
- `/capture-learnings Database indexing strategy reduced query time by 80%`
- `/capture-learnings API rate limiting implementation challenges`
- `/capture-learnings Team workflow improvements from last sprint`

## What This Does

1. **Learning Documentation**: Records valuable insights and lessons learned
2. **Best Practice Extraction**: Identifies reusable patterns and approaches
3. **Knowledge Organization**: Categorizes learnings by technology, domain, or project phase
4. **Community Preparation**: Formats learnings for potential community contribution
5. **Team Knowledge Sharing**: Creates searchable knowledge base for team reference

## Learning Categories

### Technical Discoveries
- **Performance Optimizations**: Database queries, caching strategies, code efficiency
- **Architecture Insights**: Design patterns, system scalability, microservices learnings
- **Integration Solutions**: API design, third-party service integration, data flow patterns
- **Security Implementations**: Authentication, authorization, data protection methods

### Process Improvements
- **Development Workflow**: Git strategies, code review processes, testing approaches
- **Team Collaboration**: Communication patterns, sprint planning, task distribution
- **Quality Assurance**: Testing strategies, bug prevention, code quality measures
- **Project Management**: Planning techniques, risk mitigation, milestone tracking

### Problem-Solving Approaches
- **Debugging Techniques**: Root cause analysis, systematic troubleshooting
- **Complex Solutions**: Multi-system integration, data migration, legacy modernization
- **Performance Tuning**: Bottleneck identification, optimization strategies
- **User Experience**: Interface design, accessibility, user feedback integration

## Learning Documentation Process

1. **Learning Identification**
   - Recognize valuable insights during development
   - Note unexpected solutions or creative approaches
   - Identify patterns that could help others
   - Document both successes and failures

2. **Context Capture**
   - Record the problem or challenge faced
   - Document the solution approach taken
   - Note alternative approaches considered
   - Include metrics or results achieved

3. **Knowledge Extraction**
   - Identify reusable principles or patterns
   - Extract technology-agnostic insights
   - Note conditions where approach works best
   - Document potential pitfalls or limitations

4. **Community Value Assessment**
   - Evaluate broader applicability of the learning
   - Consider potential audience and use cases
   - Assess uniqueness or novelty of the insight
   - Determine appropriate sharing format

## Output Format

**Learning Summary**
- Brief description of the insight or lesson learned
- Technology stack or domain area involved
- Impact level and measurable results

**Context and Background**
- Original problem or challenge description
- Constraints and requirements that shaped the solution
- Timeline and resources involved

**Solution Details**
- Step-by-step approach taken
- Key decisions and trade-offs made
- Tools, technologies, or techniques used
- Code examples or configuration snippets

**Results and Impact**
- Quantitative results (performance, time savings, etc.)
- Qualitative benefits (maintainability, team productivity)
- Lessons learned and insights gained
- Areas for future improvement

**Reusability Guidelines**
- When this approach is most applicable
- Prerequisites or dependencies required
- Potential modifications for different contexts
- Known limitations or edge cases

## Example Learning Documentation

### Performance Optimization Learning

**Input**: `/capture-learnings Database query optimization reduced API response time from 2s to 200ms`

```markdown
## Learning: Database Query Optimization for E-commerce Search

### Summary
- **Domain**: Database Performance / E-commerce
- **Impact**: 90% reduction in API response time (2000ms → 200ms)
- **Technology**: PostgreSQL, Node.js, Elasticsearch
- **Team Size**: 5 developers over 3 sprints

### Context and Background
Our e-commerce product search API was experiencing severe performance issues:
- Search requests taking 2+ seconds on average
- Database CPU usage consistently above 80%
- User complaints about slow search experience
- 500+ concurrent users during peak hours

**Original Approach**: 
- Single complex JOIN query across 5 tables
- Full-text search on product descriptions
- No indexing strategy
- N+1 query problem for product variants

### Solution Implementation

#### 1. Query Analysis and Indexing
```sql
-- Added composite indexes for common search patterns
CREATE INDEX idx_products_category_status ON products(category_id, status) 
WHERE status = 'active';

CREATE INDEX idx_products_search_text ON products 
USING gin(to_tsvector('english', name || ' ' || description));

-- Separate index for price range queries
CREATE INDEX idx_products_price_range ON products(price) 
WHERE status = 'active';
```

#### 2. Query Restructuring
```javascript
// ❌ Before: Single complex query with multiple JOINs
const searchProducts = async (query, filters) => {
  return await db.query(`
    SELECT p.*, c.name as category, v.price, v.stock
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN variants v ON p.id = v.product_id
    WHERE p.name ILIKE $1 
    AND p.status = 'active'
    ORDER BY p.created_at DESC
  `, [`%${query}%`]);
};

// ✅ After: Optimized with separate queries and caching
const searchProducts = async (query, filters) => {
  // Use PostgreSQL full-text search
  const productIds = await db.query(`
    SELECT id FROM products 
    WHERE search_vector @@ plainto_tsquery($1)
    AND status = 'active'
    ORDER BY ts_rank(search_vector, plainto_tsquery($1)) DESC
    LIMIT 50
  `, [query]);

  // Batch fetch related data
  const products = await db.query(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ANY($1)
  `, [productIds.map(p => p.id)]);

  // Cache results for 5 minutes
  await redis.setex(`search:${query}`, 300, JSON.stringify(products));
  return products;
};
```

#### 3. Elasticsearch Integration
```javascript
// Added Elasticsearch for complex search scenarios
const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_URL
});

const searchWithElasticsearch = async (query, filters) => {
  const searchBody = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: query,
              fields: ['name^3', 'description', 'tags'],
              type: 'best_fields'
            }
          }
        ],
        filter: [
          { term: { status: 'active' } },
          ...(filters.category ? [{ term: { category_id: filters.category } }] : []),
          ...(filters.priceRange ? [{
            range: {
              price: {
                gte: filters.priceRange.min,
                lte: filters.priceRange.max
              }
            }
          }] : [])
        ]
      }
    },
    sort: [
      { _score: { order: 'desc' } },
      { created_at: { order: 'desc' } }
    ]
  };

  const result = await elasticsearchClient.search({
    index: 'products',
    body: searchBody
  });

  return result.body.hits.hits.map(hit => hit._source);
};
```

### Results and Impact

**Performance Metrics**:
- Average response time: 2000ms → 200ms (90% improvement)
- Database CPU usage: 80% → 35% (56% reduction)
- Search relevance score: 65% → 89% (user feedback)
- Concurrent user capacity: 500 → 2000+ (4x improvement)

**Business Impact**:
- 23% increase in search-to-purchase conversion
- 15% reduction in bounce rate on search results
- Positive user feedback on search speed
- Reduced server costs due to lower resource usage

### Key Insights and Lessons

#### What Worked Well
1. **Composite Indexing**: Targeting specific query patterns rather than individual columns
2. **Full-text Search**: PostgreSQL's built-in search was more effective than LIKE queries
3. **Caching Strategy**: Redis caching for frequent searches provided immediate benefits
4. **Elasticsearch for Complex Queries**: Handled advanced filtering and relevance scoring better

#### Unexpected Discoveries
1. **Index Maintenance**: Regular VACUUM and ANALYZE operations were crucial for performance
2. **Query Planning**: EXPLAIN ANALYZE revealed query plan changes that weren't obvious
3. **Connection Pooling**: Database connection limits became bottleneck before query optimization
4. **Cache Warming**: Pre-loading popular searches during off-peak hours improved user experience

#### Pitfalls and Challenges
1. **Over-indexing**: Too many indexes initially slowed down INSERT operations
2. **Cache Invalidation**: Needed careful strategy for updating cached search results
3. **Elasticsearch Sync**: Maintaining data consistency between PostgreSQL and Elasticsearch
4. **Memory Usage**: Full-text search vectors increased database memory requirements

### Reusability Guidelines

#### When This Approach Works Best
- High-volume search applications (>1000 searches/hour)
- Complex filtering and sorting requirements
- Text-heavy product catalogs or content systems
- Performance requirements under 500ms response time

#### Prerequisites
- PostgreSQL 12+ for advanced full-text search features
- Redis for caching layer
- Elasticsearch cluster for advanced search (optional)
- Application server with connection pooling

#### Adaptation for Different Contexts

**For Smaller Applications**:
```javascript
// Simplified approach without Elasticsearch
const simpleOptimization = {
  indexing: "Basic composite indexes only",
  search: "PostgreSQL full-text search",
  caching: "Application-level caching with node-cache",
  monitoring: "Basic query timing logs"
};
```

**For Real-time Requirements**:
```javascript
// Additional optimizations for <100ms response
const realtimeOptimization = {
  precomputation: "Materialized views for common searches",
  streaming: "Server-sent events for instant results",
  edgeCaching: "CDN caching for static search results",
  clustering: "Read replicas for search-specific queries"
};
```

#### Known Limitations
- Requires significant database memory for full-text indexes
- Elasticsearch adds operational complexity
- Cache invalidation strategy needs careful planning
- May not be cost-effective for low-traffic applications

### Future Improvements
1. **Machine Learning**: Implement learning-based search ranking
2. **Personalization**: User-specific search result ordering
3. **Auto-complete**: Real-time search suggestions
4. **Analytics**: Detailed search performance monitoring
5. **A/B Testing**: Compare different search algorithms

### Community Contribution Potential
This learning could be valuable for:
- E-commerce platforms facing search performance issues
- Content management systems with large datasets
- Documentation sites requiring fast full-text search
- Any application with complex search and filtering needs

**Suggested Contribution Format**: Blog post or GitHub repository with:
- Performance benchmarking methodology
- Step-by-step implementation guide
- Database migration scripts
- Monitoring and alerting setup
- Load testing scenarios and results
```

## Follow-up Actions

After capturing learnings:
- `/contribute-now` - Prepare learning for community contribution
- `/show-learnings` - Review all captured learnings
- `/generate-documentation` - Create formal documentation
- `/best-practice` - Establish team best practices from learnings