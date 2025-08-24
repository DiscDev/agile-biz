---
allowed-tools: [Task]
argument-hint: Specify the legacy code, system, or component to refactor and modernize
---

# Refactor Legacy

Systematically modernize legacy code, systems, and architectures while maintaining functionality, improving performance, and enhancing maintainability through proven refactoring strategies.

## Usage

```
/refactor-legacy [legacy system or code to modernize]
```

**Examples:**
- `/refactor-legacy jQuery-based frontend components to modern React`
- `/refactor-legacy PHP monolith to Node.js microservices architecture`
- `/refactor-legacy database schema with performance and normalization improvements`
- `/refactor-legacy authentication system to modern OAuth2 implementation`

## What This Does

1. **Legacy Analysis**: Assess current system architecture, dependencies, and technical debt
2. **Modernization Planning**: Design migration strategy with incremental improvement approach
3. **Code Transformation**: Implement modern patterns, frameworks, and best practices
4. **Risk Mitigation**: Ensure functionality preservation during refactoring process
5. **Quality Improvement**: Enhance performance, maintainability, and security

## Refactoring Categories

### Frontend Modernization
- **Framework Migration**: jQuery to React/Vue, legacy JS to modern ES6+
- **UI Architecture**: Component-based design, state management modernization
- **Build System**: Webpack, bundling, and modern development tooling
- **Performance**: Bundle optimization, lazy loading, modern CSS techniques

### Backend System Refactoring
- **Architecture Patterns**: Monolith to microservices, layered to clean architecture
- **Language Modernization**: Legacy PHP/Java to modern frameworks and versions
- **API Design**: REST/GraphQL modernization, proper error handling
- **Database Integration**: ORM implementation, connection pooling, query optimization

### Database Schema Refactoring
- **Normalization**: Schema optimization for performance and consistency
- **Indexing Strategy**: Modern indexing approaches for query performance
- **Migration Planning**: Safe schema changes with zero downtime
- **Data Integrity**: Constraint implementation and validation improvements

### Infrastructure Modernization
- **Containerization**: Docker implementation for consistent deployment
- **CI/CD Pipeline**: Modern deployment and testing automation
- **Cloud Migration**: Legacy server to cloud-native architecture
- **Monitoring**: Modern observability and logging implementation

## Refactoring Process Framework

1. **Legacy Assessment**
   - Analyze current architecture and identify pain points
   - Document existing functionality and business logic
   - Identify dependencies and integration requirements
   - Assess risk factors and technical debt accumulation

2. **Modernization Strategy**
   - Design target architecture with modern patterns
   - Plan incremental migration approach and phases
   - Identify breaking changes and mitigation strategies
   - Establish testing and validation procedures

3. **Incremental Implementation**
   - Implement refactoring in small, manageable increments
   - Maintain backward compatibility during transition
   - Validate functionality at each step
   - Monitor performance and stability impact

4. **Quality Assurance**
   - Comprehensive testing of refactored components
   - Performance validation against original system
   - Security assessment and vulnerability remediation
   - Documentation update and knowledge transfer

## Example Refactoring Implementations

### jQuery to React Frontend Refactoring

**Input**: `/refactor-legacy jQuery-based product catalog interface to modern React with TypeScript`

```markdown
## Legacy Frontend Refactoring: jQuery to React Migration

### Legacy System Assessment

**Current Architecture Analysis**:
```javascript
// Legacy jQuery implementation (circa 2018)
// File: js/product-catalog.js - 2,847 lines of jQuery spaghetti code

$(document).ready(function() {
    // Global variables scattered throughout
    var products = [];
    var currentPage = 1;
    var filters = {};
    var sortBy = 'name';
    
    // Event handlers mixed with business logic
    $('#search-input').on('keyup', function() {
        var searchTerm = $(this).val();
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(function() {
            searchProducts(searchTerm);
        }, 300);
    });
    
    $('#category-filter').on('change', function() {
        filters.category = $(this).val();
        loadProducts();
    });
    
    // DOM manipulation scattered throughout
    function renderProducts(products) {
        var html = '';
        products.forEach(function(product) {
            html += '<div class="product-item" data-id="' + product.id + '">';
            html += '<img src="' + product.image + '" alt="' + product.name + '">';
            html += '<h3>' + product.name + '</h3>';
            html += '<p>$' + product.price.toFixed(2) + '</p>';
            html += '<button class="add-to-cart" data-id="' + product.id + '">Add to Cart</button>';
            html += '</div>';
        });
        $('#product-list').html(html);
        
        // Re-bind event handlers after DOM update
        $('.add-to-cart').off('click').on('click', function() {
            var productId = $(this).data('id');
            addToCart(productId);
        });
    }
    
    // Callback hell for async operations
    function loadProducts() {
        $.ajax({
            url: '/api/products',
            data: {
                page: currentPage,
                category: filters.category,
                search: filters.search,
                sortBy: sortBy
            },
            success: function(response) {
                products = response.data;
                renderProducts(products);
                updatePagination(response.pagination);
            },
            error: function(xhr, status, error) {
                console.error('Failed to load products:', error);
                $('#product-list').html('<p>Failed to load products</p>');
            }
        });
    }
    
    // Memory leaks from event handlers not being cleaned up
    // No proper state management
    // Difficult to test or maintain
    // Performance issues with DOM manipulation
});
```

**Technical Debt Analysis**:
- **Code Complexity**: 2,847 lines of unstructured jQuery code
- **Memory Leaks**: Event handlers not properly cleaned up
- **Performance Issues**: Frequent DOM manipulation, no virtualization
- **Maintainability**: No modular structure, global variables, callback hell
- **Testing**: No unit tests, difficult to test integrated code
- **Browser Compatibility**: Using deprecated jQuery patterns

### Modernization Strategy and Planning

**Target Architecture Design**:
```typescript
// Modern React + TypeScript architecture
// Component-based, type-safe, testable, performant

// 1. State Management with React Context + useReducer
interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: PaginationInfo;
}

// 2. Type-safe interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

// 3. Custom hooks for business logic
const useProducts = () => {
  // Product fetching and management logic
};

// 4. Component separation of concerns
const ProductCatalog = () => {
  // Main container component
};

const ProductList = () => {
  // Product listing with virtualization
};

const ProductCard = () => {
  // Individual product display
};

const ProductFilters = () => {
  // Search and filtering interface
};
```

**Migration Phases**:
```
Phase 1: Foundation Setup (Week 1)
- Set up React + TypeScript development environment
- Create basic component structure
- Implement state management foundation
- Set up testing framework

Phase 2: Core Functionality (Week 2-3)
- Migrate product display components
- Implement search and filtering
- Add pagination and sorting
- Integrate with existing API

Phase 3: Advanced Features (Week 4)
- Add shopping cart functionality
- Implement performance optimizations
- Add comprehensive testing
- Set up error handling and loading states

Phase 4: Integration & Deployment (Week 5)
- Replace jQuery implementation
- Cross-browser testing and validation
- Performance testing and optimization
- Production deployment
```

### Implementation: Component Architecture

**1. State Management with Context and Reducer**
```typescript
// contexts/ProductContext.tsx - Modern state management
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

interface ProductFilters {
  search: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'price' | 'rating' | 'newest';
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: PaginationInfo;
}

type ProductAction =
  | { type: 'FETCH_PRODUCTS_START' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: { products: Product[]; pagination: PaginationInfo } }
  | { type: 'FETCH_PRODUCTS_ERROR'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<ProductFilters> }
  | { type: 'SET_PAGE'; payload: number };

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'name'
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20
  }
};

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'FETCH_PRODUCTS_START':
      return { ...state, loading: true, error: null };
      
    case 'FETCH_PRODUCTS_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        pagination: action.payload.pagination
      };
      
    case 'FETCH_PRODUCTS_ERROR':
      return { ...state, loading: false, error: action.payload };
      
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 } // Reset to first page
      };
      
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload }
      };
      
    default:
      return state;
  }
};

const ProductContext = createContext<{
  state: ProductState;
  dispatch: React.Dispatch<ProductAction>;
} | null>(null);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  
  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within ProductProvider');
  }
  return context;
};
```

**2. Custom Hooks for Business Logic**
```typescript
// hooks/useProducts.ts - Business logic separation
import { useCallback, useEffect, useMemo } from 'react';
import { useProductContext } from '../contexts/ProductContext';
import { productAPI } from '../services/api';

export const useProducts = () => {
  const { state, dispatch } = useProductContext();
  
  // Memoized API call to prevent unnecessary re-renders
  const fetchProducts = useCallback(async () => {
    dispatch({ type: 'FETCH_PRODUCTS_START' });
    
    try {
      const response = await productAPI.getProducts({
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage,
        search: state.filters.search,
        category: state.filters.category,
        priceMin: state.filters.priceRange.min,
        priceMax: state.filters.priceRange.max,
        sortBy: state.filters.sortBy
      });
      
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: {
          products: response.data,
          pagination: response.pagination
        }
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_PRODUCTS_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch products'
      });
    }
  }, [
    dispatch,
    state.pagination.currentPage,
    state.pagination.itemsPerPage,
    state.filters.search,
    state.filters.category,
    state.filters.priceRange.min,
    state.filters.priceRange.max,
    state.filters.sortBy
  ]);
  
  // Auto-fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Memoized filter update function
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: newFilters });
  }, [dispatch]);
  
  // Memoized pagination function
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, [dispatch]);
  
  // Memoized computed values
  const hasProducts = useMemo(() => state.products.length > 0, [state.products.length]);
  const hasNextPage = useMemo(() => 
    state.pagination.currentPage < state.pagination.totalPages, 
    [state.pagination.currentPage, state.pagination.totalPages]
  );
  const hasPreviousPage = useMemo(() => 
    state.pagination.currentPage > 1, 
    [state.pagination.currentPage]
  );
  
  return {
    // State
    products: state.products,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    
    // Actions
    updateFilters,
    setPage,
    refetch: fetchProducts,
    
    // Computed values
    hasProducts,
    hasNextPage,
    hasPreviousPage
  };
};

// Custom hook for shopping cart functionality
export const useShoppingCart = () => {
  // Shopping cart logic with proper state management
  // Replaces the scattered jQuery cart functionality
};

// Custom hook for product search with debouncing
export const useProductSearch = (delay: number = 300) => {
  const { updateFilters } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounced search to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  
  useEffect(() => {
    updateFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, updateFilters]);
  
  return [searchTerm, setSearchTerm] as const;
};
```

**3. Modern Component Implementation**
```typescript
// components/ProductCatalog.tsx - Main container component
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ProductProvider } from '../contexts/ProductContext';
import ProductFilters from './ProductFilters';
import ProductList from './ProductList';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';

const ProductCatalog: React.FC = () => {
  return (
    <ProductProvider>
      <div className="product-catalog">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div className="catalog-header">
            <h1>Product Catalog</h1>
            <ProductFilters />
          </div>
          
          <div className="catalog-content">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductList />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </ProductProvider>
  );
};

export default ProductCatalog;

// components/ProductList.tsx - Optimized product listing
import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const ProductList: React.FC = memo(() => {
  const { products, loading, error, hasProducts } = useProducts();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!hasProducts) {
    return <EmptyState message="No products found" />;
  }
  
  // Virtual scrolling for performance with large product lists
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );
  
  return (
    <div className="product-list">
      <List
        height={600}
        itemCount={products.length}
        itemSize={250}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
});

ProductList.displayName = 'ProductList';
export default ProductList;

// components/ProductCard.tsx - Optimized product card
import React, { memo, useCallback } from 'react';
import { Product } from '../types';
import { useShoppingCart } from '../hooks/useShoppingCart';
import LazyImage from './LazyImage';
import StarRating from './StarRating';
import PriceDisplay from './PriceDisplay';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { addToCart } = useShoppingCart();
  
  const handleAddToCart = useCallback(() => {
    addToCart(product.id, 1);
  }, [addToCart, product.id]);
  
  return (
    <article className="product-card" data-testid={`product-${product.id}`}>
      <div className="product-image">
        <LazyImage
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <StarRating rating={product.rating} />
          <span className="review-count">({product.reviewCount} reviews)</span>
        </div>
        
        <PriceDisplay price={product.price} />
        
        <button
          type="button"
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
```

**4. Performance Optimizations**
```typescript
// utils/performance.ts - Performance optimization utilities

// Debounce hook for search input
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold, rootMargin]);

  return isIntersecting;
}

// Virtualization with react-window for large lists
// components/VirtualizedGrid.tsx
import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

interface VirtualizedGridProps {
  items: any[];
  renderItem: (props: any) => React.ReactElement;
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  renderItem,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight
}) => {
  const columnCount = Math.floor(containerWidth / itemWidth);
  const rowCount = Math.ceil(items.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = items[index];
    
    if (!item) return null;
    
    return (
      <div style={style}>
        {renderItem({ item, index })}
      </div>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      rowCount={rowCount}
      columnWidth={itemWidth}
      rowHeight={itemHeight}
      width={containerWidth}
      height={containerHeight}
      overscanRowCount={2}
      overscanColumnCount={2}
    >
      {Cell}
    </Grid>
  );
};
```

### Testing Implementation

**5. Comprehensive Testing Strategy**
```typescript
// __tests__/ProductCatalog.test.tsx - Component testing
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductProvider } from '../contexts/ProductContext';
import ProductCatalog from '../components/ProductCatalog';
import { productAPI } from '../services/api';

// Mock API
jest.mock('../services/api', () => ({
  productAPI: {
    getProducts: jest.fn()
  }
}));

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Test description',
    price: 29.99,
    image: '/test-image.jpg',
    category: 'electronics',
    rating: 4.5,
    reviewCount: 123,
    inStock: true
  }
];

const MockedProductCatalog = () => (
  <ProductProvider>
    <ProductCatalog />
  </ProductProvider>
);

describe('ProductCatalog', () => {
  beforeEach(() => {
    (productAPI.getProducts as jest.Mock).mockResolvedValue({
      data: mockProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 20
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders product catalog with products', async () => {
    render(<MockedProductCatalog />);

    expect(screen.getByText('Product Catalog')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    expect(productAPI.getProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: '',
      category: '',
      priceMin: 0,
      priceMax: 1000,
      sortBy: 'name'
    });
  });

  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<MockedProductCatalog />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.type(searchInput, 'laptop');

    await waitFor(() => {
      expect(productAPI.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'laptop' })
      );
    }, { timeout: 500 }); // Account for debounce delay
  });

  it('handles API errors gracefully', async () => {
    (productAPI.getProducts as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<MockedProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('adds products to cart', async () => {
    const user = userEvent.setup();
    render(<MockedProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);

    // Test cart functionality
    expect(screen.getByText(/Added to cart/)).toBeInTheDocument();
  });
});

// __tests__/hooks/useProducts.test.ts - Custom hook testing
import { renderHook, act } from '@testing-library/react-hooks';
import { ProductProvider } from '../../contexts/ProductContext';
import { useProducts } from '../../hooks/useProducts';
import { productAPI } from '../../services/api';

jest.mock('../../services/api');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProductProvider>{children}</ProductProvider>
);

describe('useProducts', () => {
  it('fetches products on mount', async () => {
    (productAPI.getProducts as jest.Mock).mockResolvedValue({
      data: mockProducts,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 20 }
    });

    const { result, waitForNextUpdate } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.products).toEqual(mockProducts);
    expect(productAPI.getProducts).toHaveBeenCalledTimes(1);
  });

  it('updates filters and refetches products', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts(), { wrapper });

    await waitForNextUpdate();

    act(() => {
      result.current.updateFilters({ category: 'electronics' });
    });

    await waitForNextUpdate();

    expect(productAPI.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'electronics' })
    );
  });
});
```

### Migration Execution Strategy

**6. Incremental Migration Approach**
```typescript
// migration/MigrationWrapper.tsx - Gradual migration strategy
import React, { useState, useEffect } from 'react';

interface MigrationWrapperProps {
  children: React.ReactNode;
  legacySelector: string;
  featureFlag?: string;
}

export const MigrationWrapper: React.FC<MigrationWrapperProps> = ({
  children,
  legacySelector,
  featureFlag = 'modernProductCatalog'
}) => {
  const [shouldRenderModern, setShouldRenderModern] = useState(false);

  useEffect(() => {
    // Check feature flag or gradual rollout logic
    const checkFeatureFlag = async () => {
      try {
        const response = await fetch('/api/feature-flags');
        const flags = await response.json();
        setShouldRenderModern(flags[featureFlag] === true);
      } catch (error) {
        console.error('Failed to load feature flags:', error);
        setShouldRenderModern(false);
      }
    };

    checkFeatureFlag();
  }, [featureFlag]);

  useEffect(() => {
    if (shouldRenderModern) {
      // Hide legacy jQuery implementation
      const legacyElement = document.querySelector(legacySelector);
      if (legacyElement) {
        (legacyElement as HTMLElement).style.display = 'none';
      }
    }

    return () => {
      // Show legacy implementation on unmount
      const legacyElement = document.querySelector(legacySelector);
      if (legacyElement) {
        (legacyElement as HTMLElement).style.display = 'block';
      }
    };
  }, [shouldRenderModern, legacySelector]);

  if (!shouldRenderModern) {
    return null;
  }

  return <>{children}</>;
};

// Usage in main application
const App: React.FC = () => {
  return (
    <div>
      {/* Legacy jQuery catalog remains in DOM but hidden when React version is active */}
      <div id="legacy-product-catalog">
        {/* Existing jQuery implementation */}
      </div>

      {/* Modern React implementation */}
      <MigrationWrapper legacySelector="#legacy-product-catalog">
        <ProductCatalog />
      </MigrationWrapper>
    </div>
  );
};
```

**7. Performance Comparison and Validation**
```typescript
// utils/performanceMonitoring.ts - Migration performance tracking
class MigrationPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  generateReport() {
    const report: Record<string, any> = {};
    
    this.metrics.forEach((values, name) => {
      report[name] = {
        average: this.getAverageMetric(name),
        min: Math.min(...values),
        max: Math.max(...values),
        samples: values.length
      };
    });

    return report;
  }

  compareWithBaseline(baseline: Record<string, number>) {
    const current = this.generateReport();
    const improvements: Record<string, number> = {};

    Object.keys(baseline).forEach(metric => {
      if (current[metric]) {
        const improvement = ((baseline[metric] - current[metric].average) / baseline[metric]) * 100;
        improvements[metric] = improvement;
      }
    });

    return improvements;
  }
}

const performanceMonitor = new MigrationPerformanceMonitor();

// Integration with React components
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      performanceMonitor.recordMetric(`${componentName}_render_time`, endTime - startTime);
    };
  });
};

// Baseline metrics from jQuery implementation
const jqueryBaseline = {
  initial_load_time: 2800, // ms
  search_response_time: 450, // ms
  filter_update_time: 230, // ms
  add_to_cart_time: 180, // ms
  memory_usage: 45000000, // bytes
  bundle_size: 180000 // bytes (jQuery + custom JS)
};

// Example usage in components
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  usePerformanceMonitoring('ProductCard');
  
  // Component implementation...
};
```

### Results and Migration Validation

**Migration Success Metrics**:
```markdown
## Legacy Refactoring Results: jQuery to React

### Performance Improvements
- **Initial Load Time**: 2.8s → 1.4s (50% improvement)
- **Search Response**: 450ms → 180ms (60% improvement)
- **Filter Updates**: 230ms → 45ms (80% improvement)
- **Memory Usage**: 45MB → 28MB (38% reduction)
- **Bundle Size**: 180KB → 95KB (47% reduction with tree-shaking)

### Code Quality Improvements
- **Lines of Code**: 2,847 → 1,234 (57% reduction)
- **Cyclomatic Complexity**: 247 → 89 (64% improvement)
- **Test Coverage**: 0% → 92% (comprehensive testing)
- **Type Safety**: None → Full TypeScript coverage
- **Memory Leaks**: 12 identified → 0 (eliminated with proper cleanup)

### Developer Experience Improvements
- **Build Time**: Manual concatenation → 12s automated build
- **Hot Reload**: None → <200ms development updates
- **Debugging**: console.log → React DevTools + TypeScript
- **Error Handling**: Silent failures → Comprehensive error boundaries
- **Maintainability**: Monolithic → Modular component architecture

### Business Impact
- **User Satisfaction**: 4.1/5 → 4.7/5 (15% improvement)
- **Bounce Rate**: 28% → 18% (36% reduction)
- **Conversion Rate**: 2.3% → 2.9% (26% improvement)
- **Development Velocity**: +40% (faster feature development)
- **Bug Reports**: -65% (better error handling and testing)
```

This comprehensive jQuery to React refactoring demonstrates systematic modernization with measurable improvements in performance, maintainability, and user experience while maintaining all original functionality.
```

### PHP Monolith to Node.js Microservices Refactoring

**Input**: `/refactor-legacy PHP monolith e-commerce system to Node.js microservices architecture`

```markdown
## Backend Refactoring: PHP Monolith to Node.js Microservices

### Legacy Architecture Analysis

**Current PHP Monolith Structure**:
```php
// legacy/index.php - Single entry point handling everything
<?php
session_start();
require_once 'config/database.php';
require_once 'models/User.php';
require_once 'models/Product.php';
require_once 'models/Order.php';

// Routing handled in single file
$request = $_SERVER['REQUEST_URI'];
switch ($request) {
    case '/api/products':
        handleProducts();
        break;
    case '/api/orders':
        handleOrders();
        break;
    case '/api/users':
        handleUsers();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
}

// Business logic mixed with data access
function handleProducts() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $category = $_GET['category'] ?? '';
        $search = $_GET['search'] ?? '';
        
        // SQL directly in controller logic
        $sql = "SELECT * FROM products WHERE 1=1";
        if ($category) {
            $sql .= " AND category = :category";
        }
        if ($search) {
            $sql .= " AND name LIKE :search";
        }
        
        $stmt = $pdo->prepare($sql);
        if ($category) $stmt->bindParam(':category', $category);
        if ($search) {
            $searchParam = "%$search%";
            $stmt->bindParam(':search', $searchParam);
        }
        
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($products);
    }
}

// No proper error handling, validation, or separation of concerns
// Global state everywhere, difficult to test, scale, or maintain
?>
```

**Problems Identified**:
- **Tight Coupling**: All functionality in single codebase
- **No Separation of Concerns**: Business logic mixed with data access
- **Global State**: Session and database connections shared globally
- **No Testing**: Difficult to unit test integrated code
- **Scaling Issues**: Single server, single point of failure
- **Maintenance Burden**: Changes affect entire system

### Target Microservices Architecture

**Service Breakdown Strategy**:
```javascript
// Microservices architecture design
const microservicesArchitecture = {
  services: [
    {
      name: 'user-service',
      port: 3001,
      responsibilities: ['Authentication', 'User profiles', 'User preferences'],
      database: 'users_db',
      apis: ['/auth', '/users', '/profile']
    },
    {
      name: 'product-service', 
      port: 3002,
      responsibilities: ['Product catalog', 'Inventory', 'Categories'],
      database: 'products_db',
      apis: ['/products', '/categories', '/inventory']
    },
    {
      name: 'order-service',
      port: 3003,
      responsibilities: ['Order processing', 'Order history', 'Order status'],
      database: 'orders_db',
      apis: ['/orders', '/checkout']
    },
    {
      name: 'notification-service',
      port: 3004,
      responsibilities: ['Email notifications', 'SMS alerts', 'Push notifications'],
      database: 'notifications_db',
      apis: ['/notifications', '/templates']
    }
  ],
  
  infrastructure: {
    apiGateway: 'Kong/Express Gateway',
    serviceDiscovery: 'Consul/Eureka',
    messageQueue: 'RabbitMQ',
    monitoring: 'Prometheus + Grafana',
    logging: 'ELK Stack'
  }
};
```

### Implementation: Modern Node.js Microservices

**1. User Service Implementation**
```typescript
// services/user-service/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { validateJWT } from './middleware/auth';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// Routes
const userController = new UserController();
const authController = new AuthController();

// Public routes
app.post('/auth/login', authController.login);
app.post('/auth/register', authController.register);
app.post('/auth/refresh', authController.refreshToken);

// Protected routes
app.use('/users', validateJWT);
app.get('/users/profile', userController.getProfile);
app.put('/users/profile', userController.updateProfile);
app.get('/users/:id', userController.getUser);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

app.use(errorHandler);

export { app };

// services/user-service/src/controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ValidationError } from '../errors/ValidationError';
import { logger } from '../utils/logger';

export class UserController {
  private userService = new UserService();

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await this.userService.getUserById(userId);
      
      res.json({
        data: user,
        meta: {
          service: 'user-service',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get user profile:', error);
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const updateData = req.body;

      // Validation
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.json({
        data: updatedUser,
        meta: {
          service: 'user-service',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to update user profile:', error);
      next(error);
    }
  };
}

// services/user-service/src/services/UserService.ts
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { NotFoundError } from '../errors/NotFoundError';

export class UserService {
  private userRepository = new UserRepository();

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const existingUser = await this.getUserById(id);
    
    // Business logic here
    const sanitizedData = this.sanitizeUpdateData(updateData);
    
    return await this.userRepository.update(id, sanitizedData);
  }

  private sanitizeUpdateData(data: Partial<User>): Partial<User> {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, id, createdAt, ...sanitized } = data;
    return sanitized;
  }
}
```

**2. Product Service with Advanced Features**
```typescript
// services/product-service/src/controllers/ProductController.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { CacheService } from '../services/CacheService';
import { SearchService } from '../services/SearchService';

export class ProductController {
  private productService = new ProductService();
  private cacheService = new CacheService();
  private searchService = new SearchService();

  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        q: query,
        category,
        minPrice,
        maxPrice,
        sortBy,
        page = 1,
        limit = 20
      } = req.query;

      const searchParams = {
        query: query as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100) // Max 100 per page
      };

      // Check cache first
      const cacheKey = `products:search:${JSON.stringify(searchParams)}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      
      if (cachedResult) {
        return res.json({
          ...cachedResult,
          meta: {
            ...cachedResult.meta,
            cached: true,
            service: 'product-service'
          }
        });
      }

      // Search using Elasticsearch or database
      const results = await this.searchService.searchProducts(searchParams);

      // Cache results for 5 minutes
      await this.cacheService.set(cacheKey, results, 300);

      res.json({
        ...results,
        meta: {
          ...results.meta,
          cached: false,
          service: 'product-service'
        }
      });

    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Cache individual products for longer (10 minutes)
      const cacheKey = `product:${id}`;
      let product = await this.cacheService.get(cacheKey);

      if (!product) {
        product = await this.productService.getProductById(id);
        await this.cacheService.set(cacheKey, product, 600);
      }

      res.json({
        data: product,
        meta: {
          cached: !!product,
          service: 'product-service',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  };
}

// services/product-service/src/services/SearchService.ts
import { Client } from '@elastic/elasticsearch';
import { ProductRepository } from '../repositories/ProductRepository';

export class SearchService {
  private elasticsearch = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
  });
  
  private productRepository = new ProductRepository();

  async searchProducts(params: SearchParams) {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit
    } = params;

    try {
      // Use Elasticsearch for complex search
      const searchBody: any = {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: [],
        from: (page - 1) * limit,
        size: limit
      };

      // Add search query
      if (query) {
        searchBody.query.bool.must.push({
          multi_match: {
            query,
            fields: ['name^3', 'description', 'category'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }

      // Add filters
      if (category) {
        searchBody.query.bool.filter.push({
          term: { category: category }
        });
      }

      if (minPrice || maxPrice) {
        const priceFilter: any = { range: { price: {} } };
        if (minPrice) priceFilter.range.price.gte = minPrice;
        if (maxPrice) priceFilter.range.price.lte = maxPrice;
        searchBody.query.bool.filter.push(priceFilter);
      }

      // Add sorting
      switch (sortBy) {
        case 'price-asc':
          searchBody.sort.push({ price: { order: 'asc' } });
          break;
        case 'price-desc':
          searchBody.sort.push({ price: { order: 'desc' } });
          break;
        case 'rating':
          searchBody.sort.push({ rating: { order: 'desc' } });
          break;
        default:
          searchBody.sort.push({ _score: { order: 'desc' } });
      }

      const response = await this.elasticsearch.search({
        index: 'products',
        body: searchBody
      });

      const products = response.body.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
        score: hit._score
      }));

      return {
        data: products,
        pagination: {
          page,
          limit,
          total: response.body.hits.total.value,
          pages: Math.ceil(response.body.hits.total.value / limit)
        },
        meta: {
          searchTime: response.body.took,
          maxScore: response.body.hits.max_score
        }
      };

    } catch (error) {
      // Fallback to database search if Elasticsearch fails
      console.warn('Elasticsearch failed, falling back to database search:', error);
      return await this.fallbackDatabaseSearch(params);
    }
  }

  private async fallbackDatabaseSearch(params: SearchParams) {
    // Implement database search as fallback
    return await this.productRepository.search(params);
  }
}
```

**3. Service Communication and Orchestration**
```typescript
// shared/src/services/ServiceCommunication.ts
import axios, { AxiosInstance } from 'axios';
import CircuitBreaker from 'opossum';

export class ServiceClient {
  private client: AxiosInstance;
  private circuitBreaker: CircuitBreaker<any[], any>;

  constructor(private serviceName: string, private baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Circuit breaker for resilience
    this.circuitBreaker = new CircuitBreaker(this.makeRequest.bind(this), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Add service-to-service authentication
      config.headers['X-Service-Name'] = 'order-service';
      config.headers['X-Request-ID'] = Math.random().toString(36).substring(7);
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`${this.serviceName} service error:`, error.message);
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest(method: string, url: string, data?: any) {
    return await this.client.request({
      method,
      url,
      data
    });
  }

  async get(url: string) {
    return await this.circuitBreaker.fire('GET', url);
  }

  async post(url: string, data: any) {
    return await this.circuitBreaker.fire('POST', url, data);
  }

  async put(url: string, data: any) {
    return await this.circuitBreaker.fire('PUT', url, data);
  }
}

// services/order-service/src/services/OrderService.ts
import { ServiceClient } from '../../../shared/src/services/ServiceCommunication';
import { OrderRepository } from '../repositories/OrderRepository';

export class OrderService {
  private orderRepository = new OrderRepository();
  private userService = new ServiceClient('user-service', process.env.USER_SERVICE_URL!);
  private productService = new ServiceClient('product-service', process.env.PRODUCT_SERVICE_URL!);
  private notificationService = new ServiceClient('notification-service', process.env.NOTIFICATION_SERVICE_URL!);

  async createOrder(userId: string, items: OrderItem[]) {
    try {
      // Validate user exists
      const user = await this.userService.get(`/users/${userId}`);
      if (!user.data) {
        throw new Error('User not found');
      }

      // Validate products and get current prices
      const productIds = items.map(item => item.productId);
      const products = await this.productService.post('/products/batch', { ids: productIds });
      
      // Calculate order total with current prices
      let total = 0;
      const validatedItems = items.map(item => {
        const product = products.data.find((p: any) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        return {
          ...item,
          unitPrice: product.price,
          totalPrice: itemTotal,
          productName: product.name
        };
      });

      // Create order in database
      const order = await this.orderRepository.create({
        userId,
        items: validatedItems,
        total,
        status: 'pending'
      });

      // Send confirmation notification (fire-and-forget)
      this.notificationService.post('/notifications/order-confirmation', {
        userId,
        orderId: order.id,
        orderTotal: total
      }).catch(error => {
        console.error('Failed to send order confirmation:', error);
        // Don't fail order creation if notification fails
      });

      return order;

    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }
}
```

**4. API Gateway and Service Orchestration**
```typescript
// api-gateway/src/app.ts
import express from 'express';
import httpProxy from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { ServiceDiscovery } from './services/ServiceDiscovery';
import { LoadBalancer } from './services/LoadBalancer';

const app = express();
const serviceDiscovery = new ServiceDiscovery();
const loadBalancer = new LoadBalancer();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use(limiter);

// Service routing
const createProxyMiddleware = (serviceName: string) => {
  return httpProxy({
    target: () => loadBalancer.getServiceURL(serviceName),
    changeOrigin: true,
    pathRewrite: {
      [`^/${serviceName}`]: ''
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        service: serviceName
      });
    }
  });
};

// Route to services
app.use('/user-service', createProxyMiddleware('user-service'));
app.use('/product-service', createProxyMiddleware('product-service'));
app.use('/order-service', createProxyMiddleware('order-service'));
app.use('/notification-service', createProxyMiddleware('notification-service'));

// Health check aggregation
app.get('/health', async (req, res) => {
  const services = await serviceDiscovery.getAllServices();
  const healthChecks = await Promise.allSettled(
    services.map(service => 
      fetch(`${service.url}/health`).then(r => r.json())
    )
  );

  const results = healthChecks.map((result, index) => ({
    service: services[index].name,
    status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    ...(result.status === 'fulfilled' ? result.value : { error: result.reason })
  }));

  const overallHealthy = results.every(r => r.status === 'healthy');

  res.status(overallHealthy ? 200 : 503).json({
    status: overallHealthy ? 'healthy' : 'degraded',
    services: results,
    timestamp: new Date().toISOString()
  });
});

export { app };
```

### Migration Results and Comparison

**Performance and Scalability Improvements**:
```markdown
## PHP Monolith to Node.js Microservices Migration Results

### Performance Improvements
- **API Response Time**: 890ms → 180ms (80% improvement)
- **Concurrent Users**: 50 → 500+ (10x improvement)
- **Memory Usage**: 512MB → 128MB per service (75% reduction)
- **CPU Utilization**: 85% → 45% (48% improvement)
- **Database Connections**: 50 → 15 per service (70% reduction)

### Scalability Achievements
- **Horizontal Scaling**: Single server → Auto-scaling service mesh
- **Service Independence**: Monolith downtime → Individual service resilience
- **Database Scaling**: Single DB → Service-specific databases
- **Load Handling**: 1,000 RPM → 10,000+ RPM (10x capacity)
- **Deployment Frequency**: Monthly → Multiple times daily

### Development and Maintenance
- **Code Maintainability**: Monolithic → Modular service architecture
- **Team Productivity**: +60% (parallel development on different services)
- **Bug Isolation**: System-wide → Service-specific (faster resolution)
- **Testing Coverage**: 15% → 87% (individual service testing)
- **Deployment Risk**: High (full system) → Low (individual services)

### Business Impact
- **System Uptime**: 98.5% → 99.8% (3x improvement)
- **Time to Market**: 6 weeks → 2 weeks (3x faster feature delivery)
- **Operational Costs**: 30% reduction (better resource utilization)
- **Developer Satisfaction**: 6/10 → 9/10 (modern stack and tools)
- **Customer Experience**: 4.2/5 → 4.8/5 (better performance and reliability)

### Technical Debt Reduction
- **Legacy Code**: 15,000 lines PHP → 8,000 lines TypeScript
- **Complexity Score**: 450 → 120 (73% reduction)
- **Security Vulnerabilities**: 23 → 2 (91% reduction)
- **Dependency Management**: Manual → Automated with vulnerability scanning
- **Documentation**: Sparse → Comprehensive API documentation
```

This comprehensive legacy refactoring demonstrates systematic modernization from monolithic PHP to scalable Node.js microservices with significant improvements in performance, maintainability, and business outcomes.
```

## Refactoring Quality Standards

### Legacy Analysis Depth
- **Comprehensive Assessment**: Thorough analysis of existing system architecture, dependencies, and technical debt
- **Risk Identification**: Clear documentation of potential risks and breaking changes during refactoring
- **Business Impact Analysis**: Understanding of how refactoring affects business operations and user experience
- **Dependency Mapping**: Complete mapping of system dependencies and integration points

### Modernization Strategy Quality
- **Incremental Approach**: Phased migration strategy that maintains system stability during transition
- **Best Practice Application**: Use of modern design patterns, frameworks, and architectural approaches
- **Performance Consideration**: Optimization opportunities identified and implemented during refactoring
- **Maintainability Focus**: Improved code organization, documentation, and testing coverage

### Implementation Excellence
- **Functionality Preservation**: All existing functionality maintained through refactoring process
- **Testing Coverage**: Comprehensive testing to validate refactored components work correctly
- **Performance Validation**: Measurable improvements in system performance and resource utilization
- **Documentation Update**: Complete documentation of new architecture and implementation patterns

## Follow-up Actions

After legacy refactoring completion:
- `/profile` - Conduct performance profiling of refactored system
- `/regression-test` - Execute comprehensive regression testing to validate functionality
- `/health-check` - Perform system health validation of modernized components
- `/capture-learnings` - Document refactoring insights and best practices for future modernization efforts