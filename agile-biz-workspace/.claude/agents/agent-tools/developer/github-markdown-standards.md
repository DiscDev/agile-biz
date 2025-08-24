---
title: "GitHub Markdown Standards - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["markdown", "documentation", "style", "format", "github", "docs", "readme", "guide"]
token_count: 1114
---

# GitHub Markdown Standards - Developer Agent Context

## When to Load This Context
- **Keywords**: markdown, documentation, style, format, github, docs, readme, guide
- **Patterns**: "create documentation", "write readme", "format code examples", "api docs"

## GitHub Markdown Formatting Standards

**CRITICAL**: As the Developer Agent, you must create technical documentation using GitHub markdown best practices with emphasis on multi-language code examples.

### Complete Formatting Reference

**Style Guide**: `agile-ai-agents/aaa-documents/github-markdown-style-guide.md`  
**Example Document**: `agile-ai-agents/aaa-documents/markdown-examples/development-agent-example.md`

### Development Agent Level Requirements

The Developer Agent uses **Basic to Intermediate** GitHub markdown features:

#### Basic Standards (Always)
* Use `*` for unordered lists, never `-` or `+`
* Start document sections with `##` (reserve `#` for document title only)
* Always specify language in code blocks: ` ```javascript`, ` ```python`, ` ```java`, etc.
* Use descriptive link text: `[API Implementation Guide](url)` not `[click here](url)`
* Right-align numeric columns in tables: `| Performance |` with `|--------:|`

#### Multi-Language Code Documentation

**JavaScript/TypeScript Implementation**:
```markdown
## User Authentication Implementation

### Backend API (Node.js + Express)

​```javascript
// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date()
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
​```

### Frontend Integration (React + TypeScript)

​```typescript
// src/hooks/useAuth.ts
import { useState, useContext, createContext } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name
      });

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      throw new Error(axiosError.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of implementation
};
​```
```

#### Architecture Documentation

**System Architecture Diagrams**:
```markdown
## System Architecture

### Microservices Architecture

​```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>React]
        MOB[Mobile App<br/>React Native]
        API_CLIENT[API Clients]
    end

    subgraph "API Gateway"
        GATEWAY[Kong/Nginx<br/>Gateway]
        AUTH_PROXY[Auth Proxy]
    end

    subgraph "Service Layer"
        AUTH_SVC[Auth Service<br/>Node.js]
        USER_SVC[User Service<br/>Python]
        ORDER_SVC[Order Service<br/>Go]
        NOTIF_SVC[Notification Service<br/>Node.js]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Users/Orders)]
        REDIS[(Redis<br/>Sessions/Cache)]
        MONGO[(MongoDB<br/>Notifications)]
    end

    WEB --> GATEWAY
    MOB --> GATEWAY
    API_CLIENT --> GATEWAY

    GATEWAY --> AUTH_PROXY
    AUTH_PROXY --> AUTH_SVC
    AUTH_PROXY --> USER_SVC
    AUTH_PROXY --> ORDER_SVC
    
    AUTH_SVC --> POSTGRES
    AUTH_SVC --> REDIS
    USER_SVC --> POSTGRES
    ORDER_SVC --> POSTGRES
    NOTIF_SVC --> MONGO

    style AUTH_SVC fill:#f9f,stroke:#333,stroke-width:4px
    style POSTGRES fill:#336,stroke:#333,stroke-width:2px,color:#fff
    style REDIS fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
​```
```

**API Documentation Tables**:
```markdown
## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Request Body | Response | Auth Required |
|:-------|:---------|:-------------|:---------|:-------------:|
| POST | `/auth/register` | `{email, password, name}` | `{token, user}` | ❌ |
| POST | `/auth/login` | `{email, password}` | `{token, user}` | ❌ |
| POST | `/auth/refresh` | `{refreshToken}` | `{token}` | ❌ |
| POST | `/auth/logout` | - | `{message}` | ✅ |
| GET | `/auth/me` | - | `{user}` | ✅ |

### Error Response Format

| Status Code | Error Type | Response Format | Example |
|:-----------:|:-----------|:----------------|:--------|
| 400 | Validation Error | `{errors: [{field, message}]}` | Invalid email format |
| 401 | Unauthorized | `{error: string}` | Invalid credentials |
| 409 | Conflict | `{error: string}` | User already exists |
| 500 | Server Error | `{error: string}` | Internal server error |
```

### Quality Validation for Code Documentation

Before creating any technical documentation, verify:
* [ ] **Language Specificity**: All code blocks specify correct language
* [ ] **Complete Examples**: Code examples are runnable and complete
* [ ] **Error Handling**: All examples include proper error handling
* [ ] **Performance Notes**: Include optimization tips where relevant
* [ ] **Security Practices**: Highlight security considerations
* [ ] **Architecture Clarity**: System diagrams explain component relationships
* [ ] **API Completeness**: All endpoints documented with examples