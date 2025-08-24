---
allowed-tools: [Task]
argument-hint: Specify the domain or technology area for best practices guidance
---

# Best Practice

Establish, document, and implement industry-standard best practices for specific technologies, development processes, or project domains based on current experience and community standards.

## Usage

```
/best-practice [technology, process, or domain area]
```

**Examples:**
- `/best-practice React component design and architecture`
- `/best-practice REST API design and documentation`
- `/best-practice Git workflow and branching strategy`
- `/best-practice Database design and performance optimization`
- `/best-practice Code review process and quality standards`

## What This Does

1. **Standards Definition**: Establish clear, actionable best practices for specific domains
2. **Team Alignment**: Create consistent approaches across team members and projects
3. **Quality Assurance**: Define quality standards and implementation guidelines
4. **Process Improvement**: Document proven approaches and lessons learned
5. **Onboarding Support**: Provide clear guidance for new team members

## Best Practice Categories

### Development Standards
- **Code Quality**: Naming conventions, structure patterns, documentation requirements
- **Testing Strategy**: Unit test coverage, integration testing, test organization
- **Security Practices**: Authentication, authorization, data validation, secure coding
- **Performance Optimization**: Caching strategies, query optimization, resource management

### Architecture and Design
- **System Architecture**: Component organization, separation of concerns, scalability patterns
- **Database Design**: Schema design, indexing strategy, migration management
- **API Design**: REST conventions, error handling, versioning, documentation
- **Frontend Architecture**: State management, component patterns, responsive design

### Development Workflow
- **Version Control**: Branching strategy, commit conventions, merge practices
- **Code Review**: Review process, quality checklist, feedback guidelines
- **Deployment Practices**: CI/CD pipelines, environment management, rollback procedures
- **Documentation Standards**: Code comments, API docs, architectural decisions

### Team Processes
- **Project Management**: Sprint planning, task estimation, progress tracking
- **Communication**: Meeting structures, decision documentation, knowledge sharing
- **Quality Assurance**: Testing procedures, bug tracking, quality metrics
- **Incident Response**: Problem escalation, resolution procedures, post-mortems

## Best Practice Development Process

1. **Current State Analysis**
   - Assess existing practices and identify gaps
   - Review team pain points and inefficiencies
   - Analyze industry standards and community best practices
   - Gather feedback from team members and stakeholders

2. **Standards Research**
   - Study industry best practices and proven patterns
   - Review documentation from leading organizations
   - Analyze successful open-source projects
   - Consult authoritative sources and expert opinions

3. **Practice Design**
   - Define clear, actionable guidelines
   - Create concrete examples and code samples
   - Establish measurable quality criteria
   - Design enforcement and monitoring procedures

4. **Implementation Planning**
   - Create adoption timeline and milestones
   - Develop training and onboarding materials
   - Set up tools and automation to support practices
   - Plan feedback collection and iteration cycles

## Example Best Practice Guides

### React Component Design Best Practices

**Input**: `/best-practice React component design and architecture patterns`

```markdown
## Best Practice Guide: React Component Design and Architecture

### Overview and Principles

React component design should prioritize **maintainability**, **reusability**, and **performance** while following established patterns that make code predictable and easy to understand.

**Core Design Principles**:
1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Build complex UIs by combining simple components
3. **Props-driven**: Components should be predictable based on their props
4. **Minimal State**: Keep component state as minimal and local as possible
5. **Clear Interfaces**: Define explicit prop types and clear component APIs

### Component Organization Standards

**File Structure and Naming**:
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   ├── forms/                 # Form-specific components
│   │   ├── LoginForm/
│   │   └── ContactForm/
│   ├── layout/                # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/              # Feature-specific components
│       ├── UserProfile/
│       └── ProductCatalog/
```

**Naming Conventions**:
```typescript
// ✅ GOOD: Clear, descriptive component names
const UserProfileCard = () => { /* ... */ };
const ProductSearchForm = () => { /* ... */ };
const ShoppingCartSummary = () => { /* ... */ };

// ❌ AVOID: Vague or overly generic names
const Card = () => { /* ... */ };
const Form = () => { /* ... */ };
const Component = () => { /* ... */ };
```

### Component Design Patterns

**1. Presentational vs. Container Components**

```typescript
// ✅ Presentational Component (UI-focused, no business logic)
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={`${user.name}'s avatar`} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <Button 
          onClick={() => onEdit(user.id)} 
          disabled={isLoading}
        >
          Edit
        </Button>
        <Button 
          onClick={() => onDelete(user.id)} 
          disabled={isLoading}
          variant="danger"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

// ✅ Container Component (business logic, data fetching)
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotifications();

  const handleEditUser = useCallback(async (userId: string) => {
    try {
      // Business logic for user editing
      const updatedUser = await userAPI.update(userId, editData);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      showNotification('User updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update user', 'error');
    }
  }, [showNotification]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await userAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  }, [showNotification]);

  return (
    <div className="user-management">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          isLoading={loading}
        />
      ))}
    </div>
  );
};
```

**2. Compound Components Pattern**

```typescript
// ✅ Flexible, composable modal component
interface ModalContextType {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> & {
  Header: React.FC<{ children: React.ReactNode }>;
  Body: React.FC<{ children: React.ReactNode }>;
  Footer: React.FC<{ children: React.ReactNode }>;
} = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

Modal.Header = ({ children }) => {
  const context = useContext(ModalContext);
  return (
    <div className="modal-header">
      {children}
      <button onClick={context?.onClose} className="close-button">×</button>
    </div>
  );
};

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Usage:
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>
    <h2>Confirm Action</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to delete this item?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="danger">Delete</Button>
  </Modal.Footer>
</Modal>
```

**3. Custom Hooks for Logic Reuse**

```typescript
// ✅ Extract reusable logic into custom hooks
const useAsyncData = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

// Usage in components:
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user, loading, error } = useAsyncData(
    () => userAPI.getUser(userId),
    [userId]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
};
```

### Props and State Management Standards

**Props Interface Design**:
```typescript
// ✅ GOOD: Clear, well-typed props interface
interface ProductCardProps {
  product: Product;
  
  // Event handlers with clear signatures
  onAddToCart: (productId: string, quantity: number) => void;
  onViewDetails: (productId: string) => void;
  
  // Optional props with defaults
  showAddToCart?: boolean;
  quantity?: number;
  variant?: 'default' | 'compact' | 'featured';
  
  // Loading and error states
  isLoading?: boolean;
  error?: string | null;
  
  // Accessibility props
  'aria-label'?: string;
  testId?: string;
}

// ✅ Provide default props for optional values
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  showAddToCart = true,
  quantity = 1,
  variant = 'default',
  isLoading = false,
  error = null,
  'aria-label': ariaLabel,
  testId = 'product-card'
}) => {
  // Component implementation
};
```

**State Management Best Practices**:
```typescript
// ✅ GOOD: Minimal, well-organized state
const useShoppingCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Derived state (don't store in state)
  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  );

  // Actions that modify state
  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  return {
    items,
    totalItems,
    totalPrice,
    loading,
    addItem,
    // ... other actions
  };
};
```

### Performance Optimization Standards

**Component Memoization**:
```typescript
// ✅ Memoize components that receive stable props
const ProductList = React.memo<ProductListProps>(({ 
  products, 
  onProductSelect,
  category 
}) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for complex props
  return (
    prevProps.category === nextProps.category &&
    prevProps.products.length === nextProps.products.length &&
    prevProps.products.every((product, index) => 
      product.id === nextProps.products[index]?.id
    )
  );
});

// ✅ Memoize expensive calculations
const ProductAnalytics: React.FC<{ products: Product[] }> = ({ products }) => {
  const analytics = useMemo(() => {
    // Expensive calculation
    return {
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
      categoryDistribution: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0)
    };
  }, [products]);

  return <AnalyticsDisplay analytics={analytics} />;
};
```

**Lazy Loading and Code Splitting**:
```typescript
// ✅ Lazy load heavy components
const AdminDashboard = lazy(() => 
  import('./AdminDashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

const UserSettings = lazy(() => import('./UserSettings'));

// ✅ Use Suspense with meaningful fallbacks
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<LoadingSpinner />}>
            <UserSettings />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
};
```

### Error Handling and Validation Standards

**Error Boundaries**:
```typescript
// ✅ Implement error boundaries for component error isolation
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Component error:', error, errorInfo);
    // You could send to error tracking service here
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Usage:
<ComponentErrorBoundary fallback={ProductErrorFallback}>
  <ProductCatalog />
</ComponentErrorBoundary>
```

**Input Validation**:
```typescript
// ✅ Validate props with runtime type checking
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date()
});

interface UserCardProps {
  user: z.infer<typeof UserSchema>;
  onEdit: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // Validate user data at runtime
  useEffect(() => {
    try {
      UserSchema.parse(user);
    } catch (error) {
      console.error('Invalid user data:', error);
      // Handle invalid data appropriately
    }
  }, [user]);

  // Component implementation
};
```

### Testing Standards

**Component Testing Structure**:
```typescript
// UserCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCard } from './UserCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user' as const,
  createdAt: new Date('2024-01-01')
};

describe('UserCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  it('disables buttons when loading', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
  });

  it('handles missing avatar gracefully', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };
    
    render(
      <UserCard 
        user={userWithoutAvatar} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete}
      />
    );

    const avatar = screen.getByAltText(`${mockUser.name}'s avatar`);
    expect(avatar).toHaveAttribute('src', '/default-avatar.png');
  });
});
```

### Accessibility Standards

**ARIA and Semantic HTML**:
```typescript
// ✅ Proper accessibility implementation
const SearchForm: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  return (
    <form role="search" onSubmit={handleSearch}>
      <label htmlFor="search-input">
        Search products
      </label>
      <input
        id="search-input"
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-expanded={suggestions.length > 0}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-describedby={suggestions.length > 0 ? 'suggestions-list' : undefined}
      />
      
      {suggestions.length > 0 && (
        <ul 
          id="suggestions-list"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === activeSuggestion}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      
      <button type="submit" aria-label="Search">
        🔍
      </button>
    </form>
  );
};
```

### Documentation Standards

**Component Documentation Template**:
```typescript
/**
 * UserCard component displays user information with edit and delete actions.
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={user}
 *   onEdit={(userId) => console.log('Edit:', userId)}
 *   onDelete={(userId) => console.log('Delete:', userId)}
 *   isLoading={false}
 * />
 * ```
 */
interface UserCardProps {
  /** User object containing id, name, email, and other user details */
  user: User;
  
  /** Callback function called when edit button is clicked */
  onEdit: (userId: string) => void;
  
  /** Callback function called when delete button is clicked */
  onDelete: (userId: string) => void;
  
  /** Optional loading state to disable actions */
  isLoading?: boolean;
  
  /** Optional CSS class name for custom styling */
  className?: string;
  
  /** Test ID for automated testing */
  testId?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  isLoading = false,
  className,
  testId = 'user-card'
}) => {
  // Implementation details...
};
```

### Quality Checklist

**Component Review Checklist**:
- [ ] **Single Responsibility**: Component has one clear purpose
- [ ] **Props Interface**: Well-typed props with clear documentation
- [ ] **Error Handling**: Graceful handling of edge cases and errors
- [ ] **Performance**: Appropriate memoization and optimization
- [ ] **Accessibility**: Proper ARIA attributes and semantic HTML
- [ ] **Testing**: Comprehensive test coverage for functionality and edge cases
- [ ] **Documentation**: Clear examples and prop documentation
- [ ] **Responsive Design**: Component works across different screen sizes

**Code Quality Standards**:
- [ ] **TypeScript**: Proper type definitions and no `any` types
- [ ] **Naming**: Clear, descriptive names for components and functions
- [ ] **Consistency**: Follows established project patterns
- [ ] **Simplicity**: Avoids unnecessary complexity
- [ ] **Reusability**: Can be easily reused in different contexts
```

### REST API Design Best Practices

**Input**: `/best-practice REST API design principles and implementation standards`

```markdown
## Best Practice Guide: REST API Design and Implementation

### Core REST Principles

**Resource-Centric Design**:
```
✅ GOOD: Resources as nouns
GET /users
GET /users/123
POST /users
PUT /users/123
DELETE /users/123

❌ AVOID: Actions as verbs
GET /getUsers
POST /createUser
PUT /updateUser/123
DELETE /removeUser/123
```

**HTTP Method Standards**:
```http
GET /users           # Retrieve list of users
GET /users/123       # Retrieve specific user
POST /users          # Create new user
PUT /users/123       # Update entire user (replace)
PATCH /users/123     # Partial update of user
DELETE /users/123    # Delete user

# Nested resources
GET /users/123/orders     # Get orders for specific user
POST /users/123/orders   # Create order for specific user
```

### URL Structure Standards

**Resource Naming Conventions**:
```
✅ GOOD: Consistent plural nouns
/api/v1/users
/api/v1/products
/api/v1/orders

✅ GOOD: Hierarchical relationships
/api/v1/users/123/orders
/api/v1/categories/5/products
/api/v1/orders/456/items

✅ GOOD: Query parameters for filtering
/api/v1/products?category=electronics&price_min=100&price_max=500
/api/v1/users?role=admin&status=active&limit=20&offset=0

❌ AVOID: Mixed singular/plural
/api/v1/user
/api/v1/products

❌ AVOID: Verbs in URLs
/api/v1/getUserOrders
/api/v1/products/search
```

### Response Format Standards

**Success Response Structure**:
```json
// Single resource
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Collection response
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  },
  "meta": {
    "requestId": "req_123457",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response Structure**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "age",
        "message": "Age must be between 18 and 120",
        "code": "OUT_OF_RANGE"
      }
    ]
  },
  "meta": {
    "requestId": "req_123458",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Implementation Example

**Express.js API Implementation**:
```typescript
// User controller with proper REST patterns
class UserController {
  // GET /users - List users with filtering and pagination
  async listUsers(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 20,
        role,
        status,
        search
      } = req.query;

      const filters: UserFilters = {};
      if (role) filters.role = role as string;
      if (status) filters.status = status as string;
      if (search) filters.search = search as string;

      const result = await userService.listUsers({
        filters,
        pagination: {
          page: Number(page),
          pageSize: Math.min(Number(pageSize), 100) // Limit max page size
        }
      });

      res.status(200).json({
        data: result.users,
        pagination: {
          page: result.pagination.page,
          pageSize: result.pagination.pageSize,
          totalItems: result.pagination.totalItems,
          totalPages: Math.ceil(result.pagination.totalItems / result.pagination.pageSize)
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id - Get specific user
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID must be a valid UUID'
          }
        });
      }

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          }
        });
      }

      res.status(200).json({
        data: user,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /users - Create new user
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validationResult = userValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationResult.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code
            }))
          }
        });
      }

      const userData = validationResult.data;

      // Check for duplicate email
      const existingUser = await userService.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'A user with this email already exists'
          }
        });
      }

      const newUser = await userService.createUser(userData);

      res.status(201).json({
        data: newUser,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // PUT /users/:id - Update entire user (replace)
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID must be a valid UUID'
          }
        });
      }

      // Validate request body
      const validationResult = userValidationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationResult.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message
            }))
          }
        });
      }

      const userData = validationResult.data;
      const updatedUser = await userService.updateUser(id, userData);

      if (!updatedUser) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          }
        });
      }

      res.status(200).json({
        data: updatedUser,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id - Partial user update
  async patchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID must be a valid UUID'
          }
        });
      }

      // Validate partial update data
      const validationResult = userPartialUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationResult.error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message
            }))
          }
        });
      }

      const updateData = validationResult.data;
      const updatedUser = await userService.patchUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          }
        });
      }

      res.status(200).json({
        data: updatedUser,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // DELETE /users/:id - Delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID must be a valid UUID'
          }
        });
      }

      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID ${id} not found`
          }
        });
      }

      // 204 No Content for successful deletion
      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }
}
```

This comprehensive best practice guide provides actionable guidelines for React components and REST API design with concrete examples and implementation patterns.
```

## Best Practice Quality Standards

### Completeness Requirements
- **Actionable Guidelines**: Specific, implementable recommendations with code examples
- **Quality Criteria**: Clear metrics and standards for measuring compliance
- **Common Pitfalls**: Document frequent mistakes and how to avoid them
- **Implementation Examples**: Working code examples that demonstrate the practices

### Practical Application
- **Tool Integration**: Recommend tools and automation to support the practices
- **Team Adoption**: Provide guidance for introducing practices to existing teams
- **Measurement**: Define metrics to track adherence and effectiveness
- **Continuous Improvement**: Process for evolving practices based on feedback

### Documentation Standards
- **Clear Structure**: Logical organization with easy-to-find information
- **Examples**: Code examples for all major concepts and patterns
- **Rationale**: Explain why practices are recommended, not just what they are
- **Context**: Address when practices apply and when exceptions might be appropriate

## Follow-up Actions

After establishing best practices:
- `/implement [practice area]` - Apply best practices to current project code
- `/generate-documentation` - Create formal documentation from best practice guidelines
- `/capture-learnings` - Document insights from implementing new practices
- `/review-code` - Audit existing code against newly established best practices