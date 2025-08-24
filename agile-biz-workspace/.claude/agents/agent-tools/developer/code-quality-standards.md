---
title: "Code Quality Standards - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["refactor", "quality", "standard", "defensive", "security", "clean", "review", "maintain", "best practices"]
token_count: 3671
---

# Code Quality Standards - Developer Agent Context

## When to Load This Context
- **Keywords**: refactor, quality, standard, defensive, security, clean, review, maintain, best practices
- **Patterns**: "clean up code", "improve quality", "security review", "refactor this", "make it better"

## Code Quality Standards

### Naming Conventions
```yaml
code_standards:
  naming_conventions:
    variables: "camelCase"
    functions: "camelCase"
    classes: "PascalCase"
    constants: "UPPER_CASE"
    
  documentation:
    inline_comments: "Required for complex logic"
    function_docs: "Required for all public functions"
    api_docs: "OpenAPI/Swagger specification"
    
  testing:
    unit_test_coverage: "80%"
    integration_tests: "Critical paths"
    test_naming: "describe_what_when_then"
    
  security:
    input_validation: "All user inputs"
    authentication: "JWT tokens"
    authorization: "Role-based access control"
```

## Defensive Programming Standards

**MANDATORY**: All code must follow defensive programming practices to prevent runtime errors and production failures. This comprehensive guide provides defensive programming principles, training, and copy-paste ready templates based on real-world incidents from community learnings.

### The Golden Rules
1. **Never trust data structure** - Always assume data can be null, undefined, or malformed
2. **Fail gracefully** - Provide meaningful defaults instead of crashing
3. **Validate early** - Check inputs at the entry point of every function
4. **Use optional chaining** - `?.` is your safety net for object property access
5. **Type check arrays** - Use `Array.isArray()` before array methods
6. **Handle async errors** - Wrap all async operations in try/catch blocks
7. **Test with null data** - Always test your code with null, undefined, and malformed data

### Why Defensive Programming?
From real-world project incidents:
```javascript
// What happened:
// 1. User logged in successfully
// 2. Code assumed user object always exists
// 3. User's session expired, user became null
// 4. Site crashed for all users
// 5. Production down for 2 hours

// The crash:
const userName = user.name; // 💥 Cannot read property 'name' of null

// The fix:
const userName = user?.name || 'Guest'; // ✅ Safe, always works
```

### Common Failure Scenarios
```javascript
// Scenario 1: User logs out, object becomes null
const userName = user.name; // 💥 Cannot read property 'name' of null

// Scenario 2: API returns unexpected structure
const items = response.data.items; // 💥 Cannot read property 'items' of undefined

// Scenario 3: Array operations on non-arrays
const count = products.length; // 💥 Cannot read property 'length' of null

// Scenario 4: Function calls on undefined
callback(data); // 💥 callback is not a function

// Scenario 5: Nested property access
const city = user.address.city; // 💥 Multiple failure points
```

### Essential Patterns

#### Pattern 1: Optional Chaining (`?.`)
Optional chaining safely accesses nested properties, returning `undefined` instead of throwing errors.

```javascript
// Basic usage
const city = user?.address?.city;
const phone = contact?.details?.phone?.primary;

// Array access
const firstItem = items?.[0];
const userByIndex = users?.[userIndex];

// Function calls
const result = api?.getData?.();
onSuccess?.(data);

// Deep nesting
const value = data?.response?.results?.[0]?.details?.value;
```

#### Pattern 2: Nullish Coalescing (`??`)
Use `??` instead of `||` when you want to keep falsy values like 0 or empty string:

```javascript
// Problem with ||
const count = data.count || 10; // Wrong! 0 becomes 10
const name = data.name || 'Unknown'; // Wrong! '' becomes 'Unknown'

// Solution with ??
const count = data.count ?? 10; // Correct! Only null/undefined become 10
const name = data.name ?? 'Unknown'; // Correct! Empty string preserved
```

#### Pattern 3: Array Safety
Always verify arrays before using array methods:

```javascript
// Type checking
const items = Array.isArray(data?.items) ? data.items : [];

// Safe operations
const count = items?.length ?? 0;
const firstItem = items?.[0];
const validItems = items?.filter?.(item => item?.isValid) ?? [];
```

#### Pattern 4: Function Safety
Verify functions before calling:

```javascript
// Type checking
if (typeof callback === 'function') {
  callback(data);
}

// Optional chaining
onSuccess?.(data);
onClick?.(event);

// With fallback
const handler = onSubmit || defaultHandler;
handler(formData);
```

### Code Templates

#### Safe Object Access Patterns
```javascript
// ❌ BAD - Multiple failure points
const city = user.address.city;
const theme = config.ui.theme.primary;

// ✅ GOOD - Safe at every level
const city = user?.address?.city ?? 'Unknown';
const theme = config?.ui?.theme?.primary ?? 'default';

// ✅ BETTER - Intermediate variables for complex access
const address = user?.address ?? {};
const city = address.city ?? 'Unknown';
const zipCode = address.zipCode ?? '00000';

// ✅ BEST - Validation at entry point
function displayUserLocation(user = {}) {
  const { address = {} } = user;
  const { city = 'Unknown', zipCode = '00000' } = address;
  
  return `${city}, ${zipCode}`;
}
```

#### Safe Array Operations
```javascript
// ❌ BAD - Fails if prices is not an array
const total = prices.reduce((sum, price) => sum + price, 0);

// ✅ GOOD - Protected reduce
const total = Array.isArray(prices) 
  ? prices.reduce((sum, price) => sum + (price || 0), 0)
  : 0;

// ✅ BETTER - Complete safety
const total = (prices ?? [])
  .filter(price => typeof price === 'number' && price > 0)
  .reduce((sum, price) => sum + price, 0);

// ✅ BEST - Reusable helper
function safeArraySum(array, getValue = (x) => x) {
  if (!Array.isArray(array)) return 0;
  
  return array
    .map(getValue)
    .filter(val => typeof val === 'number' && !isNaN(val))
    .reduce((sum, val) => sum + val, 0);
}

const total = safeArraySum(prices);
const totalValues = safeArraySum(items, item => item?.value);
```

### React-Specific Patterns

#### Safe Component Props
```jsx
// ❌ BAD - No prop validation
function UserCard({ user, onUpdate }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={() => onUpdate(user.id)}>Update</button>
    </div>
  );
}

// ✅ GOOD - Defensive props
function UserCard({ user = {}, onUpdate = () => {} }) {
  const name = user?.name ?? 'Anonymous User';
  const email = user?.email ?? '';
  const id = user?.id;
  
  const handleUpdate = () => {
    if (id && typeof onUpdate === 'function') {
      onUpdate(id);
    }
  };
  
  return (
    <div>
      <h2>{name}</h2>
      {email && <p>{email}</p>}
      <button onClick={handleUpdate} disabled={!id}>
        Update
      </button>
    </div>
  );
}
```

#### Safe State Management
```jsx
// ❌ BAD - Assumes data structure
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data.users); // Dangerous!
    });
  }, []);
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// ✅ GOOD - Defensive state management
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchUsers();
        
        // Validate response structure
        const userData = response?.data?.users ?? response?.users ?? [];
        const validUsers = Array.isArray(userData) ? userData : [];
        
        setUsers(validUsers);
        setError(null);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Failed to load users');
        setUsers([]); // Safe fallback
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {users.length > 0 ? (
        users.map(user => (
          <div key={user?.id || Math.random()}>
            {user?.name ?? 'Unknown User'}
          </div>
        ))
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
}
```

#### Error Boundaries
```jsx
// ✅ REQUIRED - Error boundary for all major components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Optional: Send to error reporting service
    // errorReportingService.report(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage - Wrap components that might fail
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
```

#### Safe Event Handlers
```jsx
// ❌ BAD - No validation
function Form({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    onSubmit(Object.fromEntries(data));
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ GOOD - Defensive event handling
function Form({ onSubmit = () => {} }) {
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    
    try {
      if (!e?.target) {
        console.warn('Form submit event missing target');
        return;
      }
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      // Validate data before sending
      const validatedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => 
          key && value !== undefined
        )
      );
      
      if (typeof onSubmit === 'function') {
        onSubmit(validatedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Response Handling

#### Basic Response Validation
```javascript
// ❌ BAD - Assumes response structure
async function fetchUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data.user; // Dangerous!
}

// ✅ GOOD - Basic validation
async function fetchUser(id) {
  try {
    const response = await api.get(`/users/${id}`);
    
    if (!response?.data?.user) {
      throw new Error('User not found in response');
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

// ✅ BETTER - Complete validation
async function fetchUser(id) {
  try {
    if (!id) {
      throw new Error('User ID is required');
    }
    
    const response = await api.get(`/users/${id}`);
    
    // Validate response structure
    const user = response?.data?.user ?? response?.user;
    
    if (!user?.id) {
      throw new Error('Invalid user data received');
    }
    
    // Return normalized user object
    return {
      id: user.id,
      name: user.name ?? 'Unknown User',
      email: user.email ?? '',
      isActive: user.isActive ?? true,
      createdAt: user.createdAt ?? new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return {
      id: null,
      name: 'Unknown User',
      email: '',
      isActive: false,
      createdAt: new Date().toISOString()
    };
  }
}
```

#### Response Validator Class
```javascript
class ResponseValidator {
  constructor(schema) {
    this.schema = schema;
  }
  
  validate(response) {
    const errors = [];
    const data = response?.data ?? response;
    
    for (const [key, rules] of Object.entries(this.schema)) {
      const value = data?.[key];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }
      
      if (value !== undefined && rules.type && typeof value !== rules.type) {
        errors.push(`Invalid type for ${key}: expected ${rules.type}, got ${typeof value}`);
      }
      
      if (rules.arrayOf && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item !== rules.arrayOf) {
            errors.push(`Invalid array item type at ${key}[${index}]: expected ${rules.arrayOf}`);
          }
        });
      }
    }
    
    return { isValid: errors.length === 0, errors, data };
  }
}

// Usage
const userValidator = new ResponseValidator({
  id: { required: true, type: 'string' },
  name: { required: true, type: 'string' },
  email: { required: false, type: 'string' },
  roles: { required: false, type: 'object', arrayOf: 'string' }
});

async function fetchValidatedUser(id) {
  try {
    const response = await api.get(`/users/${id}`);
    const validation = userValidator.validate(response);
    
    if (!validation.isValid) {
      console.warn('Validation errors:', validation.errors);
      // Return safe defaults for invalid data
    }
    
    return validation.data;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
}
```

#### List Response Handling
```javascript
// ❌ BAD - No validation
async function fetchUsers() {
  const response = await api.get('/users');
  return response.data;
}

// ✅ GOOD - Defensive list handling
async function fetchUsers() {
  try {
    const response = await api.get('/users');
    
    // Handle different response structures
    const users = response?.data?.users ?? response?.users ?? response?.data ?? [];
    
    // Ensure we have an array
    if (!Array.isArray(users)) {
      console.warn('Expected array, got:', typeof users);
      return { users: [], total: 0 };
    }
    
    // Filter and normalize user data
    const validUsers = users
      .filter(user => user?.id) // Must have ID
      .map(user => ({
        id: user.id,
        name: user.name ?? 'Unknown',
        email: user.email ?? '',
        isActive: user.isActive ?? true
      }));
    
    return {
      users: validUsers,
      total: response?.data?.total ?? validUsers.length
    };
    
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { users: [], total: 0 };
  }
}
```

### Testing Defensive Code

#### Unit Testing Patterns
```javascript
describe('Defensive Programming Tests', () => {
  describe('Optional Chaining', () => {
    it('handles null objects gracefully', () => {
      const user = null;
      const name = user?.name ?? 'Guest';
      expect(name).toBe('Guest');
    });
    
    it('handles undefined properties gracefully', () => {
      const user = {};
      const city = user?.address?.city ?? 'Unknown';
      expect(city).toBe('Unknown');
    });
    
    it('handles nested null properties', () => {
      const user = { address: null };
      const city = user?.address?.city ?? 'Unknown';
      expect(city).toBe('Unknown');
    });
  });
  
  describe('Array Safety', () => {
    it('handles non-array values safely', () => {
      const notArray = null;
      const count = Array.isArray(notArray) ? notArray.length : 0;
      expect(count).toBe(0);
    });
    
    it('safely processes arrays with invalid items', () => {
      const mixedArray = [
        { id: 1, name: 'Valid' },
        null,
        undefined,
        { name: 'No ID' },
        { id: 2, name: 'Also Valid' }
      ];
      
      const validItems = mixedArray
        .filter(item => item?.id && item?.name)
        .map(item => ({ id: item.id, name: item.name }));
      
      expect(validItems).toHaveLength(2);
      expect(validItems[0]).toEqual({ id: 1, name: 'Valid' });
    });
  });
  
  describe('Function Safety', () => {
    it('handles undefined callbacks gracefully', () => {
      const callback = undefined;
      expect(() => {
        callback?.('test');
      }).not.toThrow();
    });
    
    it('validates function types before calling', () => {
      const notAFunction = 'not a function';
      const safeCall = (fn) => {
        if (typeof fn === 'function') {
          return fn('test');
        }
        return 'fallback';
      };
      
      expect(safeCall(notAFunction)).toBe('fallback');
    });
  });
});
```

#### React Component Testing
```javascript
describe('Safe React Components', () => {
  it('handles null props gracefully', () => {
    const { getByText } = render(<UserCard user={null} />);
    expect(getByText('Anonymous User')).toBeInTheDocument();
  });
  
  it('handles missing nested properties', () => {
    const user = { name: 'John' }; // Missing email, address, etc.
    const { getByText, queryByText } = render(<UserCard user={user} />);
    
    expect(getByText('John')).toBeInTheDocument();
    expect(queryByText('@')).not.toBeInTheDocument(); // No email shown
  });
  
  it('handles undefined event handlers', () => {
    const user = { id: '1', name: 'John' };
    const { getByRole } = render(<UserCard user={user} />);
    
    const button = getByRole('button');
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });
});
```

### Common Pitfalls

#### Pitfall 1: Incomplete Protection
```javascript
// ❌ BAD - Only protecting first level
const name = user?.name;
const city = user.address.city; // Still dangerous!

// ✅ GOOD - Protect all levels
const name = user?.name ?? 'Guest';
const city = user?.address?.city ?? 'Unknown';
```

#### Pitfall 2: Forgetting Array Checks
```javascript
// ❌ BAD - Not checking if roles is an array
const isAdmin = user?.roles.includes('admin');

// ✅ GOOD - Complete protection
const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');
const isAdmin = user?.roles?.includes?.('admin') ?? false;
```

#### Pitfall 3: Trusting Function Parameters
```javascript
// ❌ BAD - Assuming config is valid
function initialize(config) {
  const apiUrl = config.api.endpoint;
  const timeout = config.api.timeout;
}

// ✅ GOOD - Validate parameters
function initialize(config = {}) {
  const api = config.api ?? {};
  const apiUrl = api.endpoint ?? 'https://api.example.com';
  const timeout = api.timeout ?? 5000;
  
  if (typeof apiUrl !== 'string') {
    throw new Error('API endpoint must be a string');
  }
}
```

#### Pitfall 4: Not Handling Async Errors
```javascript
// ❌ BAD - Unhandled promise rejection
async function loadData() {
  const data = await api.getData();
  setData(data);
}

// ✅ GOOD - Proper error handling
async function loadData() {
  try {
    const response = await api.getData();
    const data = response?.data ?? [];
    setData(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to load data:', error);
    setData([]); // Safe fallback
  }
}
```

### Security Best Practices

#### Input Validation
```javascript
// Validate and sanitize inputs
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
}

// SQL injection prevention (use parameterized queries)
// ❌ NEVER do this
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ ALWAYS do this
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);
```

#### Authentication & Authorization
```javascript
// JWT middleware example
function verifyToken(req, res, next) {
  const token = req.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based access control
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### Development Workflow Standards

```yaml
git_workflow:
  branching_strategy: "GitFlow"
  main_branch: "main"
  development_branch: "develop"
  feature_branches: "feature/[ticket-id]-description"
  
  commit_standards:
    format: "type(scope): description"
    types: ["feat", "fix", "docs", "style", "refactor", "test"]
    
code_review:
  required_reviewers: 1
  review_checklist:
    - "Code follows standards"
    - "Tests are included"
    - "Documentation is updated"
    - "Security considerations addressed"
    - "Defensive programming patterns applied"
```

### Code Quality Tools

#### JavaScript/TypeScript
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}

// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2
};
```

#### Python
```python
# Setup.cfg for flake8, black, etc.
[flake8]
max-line-length = 88
extend-ignore = E203, W503

[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### Performance Optimization Patterns

```javascript
// Memoization
const expensiveCalculation = useMemo(() => {
  return data?.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
}, [data?.items]);

// Debouncing
const debouncedSearch = useCallback(
  debounce((query) => {
    if (query?.length >= 2) {
      searchAPI(query);
    }
  }, 300),
  []
);

// Lazy loading
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```