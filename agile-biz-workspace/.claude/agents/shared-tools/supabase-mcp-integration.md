---
title: "Supabase MCP Integration - Shared Tool"
type: "shared-tool"
keywords: ["supabase", "mcp", "backend", "database", "auth", "authentication", "storage", "realtime"]
agents: ["developer", "devops", "dba", "api"]
token_count: 2147
---

# Supabase MCP Integration - Shared Tool

## When to Load This Context
- **Keywords**: supabase, mcp, backend, database, auth, authentication, storage, realtime
- **Patterns**: "backend service", "database setup", "user authentication", "file storage"
- **Shared by**: Developer, DBA, API, Security, DevOps agents

## Supabase MCP Server Overview

**Supabase MCP Server**: Complete backend platform with database, authentication, storage, and real-time capabilities
- **Setup Guide**: See `project-mcps/supabase-mcp-setup.md` for configuration
- **Capabilities**: PostgreSQL database, authentication, file storage, real-time subscriptions
- **Tools Available**: `supabase_create_table`, `supabase_query`, `supabase_create_user`, `supabase_upload_file`
- **Benefits**: Full-stack backend capabilities with built-in auth and real-time features

## Agent-Specific Usage

### For Developer Agents
- Set up backend services for applications
- Integrate authentication and user management
- Implement real-time features and subscriptions
- Manage application data and file storage

### For DBA Agents
- Create and manage database schemas
- Optimize database queries and performance
- Set up database migrations and backups
- Monitor database health and usage

### For API Agents
- Create and manage API endpoints
- Implement authentication middleware
- Set up real-time API subscriptions
- Manage API rate limiting and security

### For Security Agents
- Configure authentication and authorization
- Set up role-based access control (RLS)
- Manage security policies and rules
- Monitor security events and logs

### For DevOps Agents
- Deploy and manage Supabase instances
- Configure environment variables and secrets
- Set up monitoring and alerting
- Manage backup and disaster recovery

## Core Supabase Features

### Database Management
```sql
-- Create table with RLS
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Authentication
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// User registration
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      name: 'John Doe',
    }
  }
});

// User login
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Real-time Subscriptions
```javascript
// Subscribe to table changes
const subscription = supabase
  .channel('public:users')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Subscribe to specific row changes
const userSubscription = supabase
  .channel(`public:users:id=eq.${userId}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
    (payload) => {
      console.log('User updated:', payload.new);
    }
  )
  .subscribe();
```

### File Storage
```javascript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  });

// Download file
const { data: fileData } = await supabase.storage
  .from('avatars')
  .download(`${userId}/avatar.jpg`);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```

## MCP Tools Usage

### supabase_create_table
**Purpose**: Create database tables with proper configuration
**Parameters**:
- `table_name`: Name of the table to create
- `columns`: Array of column definitions
- `policies`: Row Level Security policies

```javascript
await mcp.supabase_create_table({
  table_name: 'profiles',
  columns: [
    { name: 'id', type: 'UUID', default: 'gen_random_uuid()', primary_key: true },
    { name: 'user_id', type: 'UUID', references: 'auth.users(id)', not_null: true },
    { name: 'username', type: 'TEXT', unique: true },
    { name: 'avatar_url', type: 'TEXT' },
    { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' }
  ],
  policies: [
    {
      name: 'Users can view own profile',
      action: 'SELECT',
      condition: 'auth.uid() = user_id'
    },
    {
      name: 'Users can update own profile',
      action: 'UPDATE',
      condition: 'auth.uid() = user_id'
    }
  ]
});
```

### supabase_query
**Purpose**: Execute database queries safely
**Parameters**:
- `query`: SQL query string
- `params`: Query parameters (for prepared statements)

```javascript
// Select with parameters
const result = await mcp.supabase_query({
  query: 'SELECT * FROM profiles WHERE user_id = $1',
  params: [userId]
});

// Insert with parameters
await mcp.supabase_query({
  query: `
    INSERT INTO profiles (user_id, username, avatar_url)
    VALUES ($1, $2, $3)
  `,
  params: [userId, username, avatarUrl]
});
```

### supabase_create_user
**Purpose**: Create authenticated user with profile
**Parameters**:
- `email`: User email address
- `password`: User password
- `metadata`: Additional user data

```javascript
await mcp.supabase_create_user({
  email: 'newuser@example.com',
  password: 'securepassword123',
  metadata: {
    name: 'New User',
    role: 'user',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  }
});
```

### supabase_upload_file
**Purpose**: Upload files to Supabase Storage
**Parameters**:
- `bucket`: Storage bucket name
- `path`: File path within bucket
- `file`: File data or content
- `options`: Upload options (cache, upsert, etc.)

```javascript
await mcp.supabase_upload_file({
  bucket: 'user-uploads',
  path: `${userId}/documents/report.pdf`,
  file: fileBuffer,
  options: {
    cacheControl: '3600',
    upsert: true,
    contentType: 'application/pdf'
  }
});
```

## Common Integration Patterns

### Full-Stack Authentication Setup
```javascript
// 1. Set up Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Create auth context (React)
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Database Migration Pattern
```sql
-- Migration: Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Real-time Chat Implementation
```javascript
// Chat component with real-time updates
export function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Load existing messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.user_name}:</strong> {message.content}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
}
```

## Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

-- Create policies for different access levels
CREATE POLICY "Users can only see their data" ON user_data
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin can see all data" ON user_data
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

### API Route Security
```javascript
// pages/api/admin/users.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Service role for admin operations
);

export default async function handler(req, res) {
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Proceed with admin operations
}
```

## Performance Optimization

### Query Optimization
```javascript
// Use select() to limit returned columns
const { data } = await supabase
  .from('profiles')
  .select('id, username, avatar_url')  // Only needed columns
  .eq('user_id', userId)
  .single();

// Use pagination for large datasets
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(0, 9)  // First 10 items
  .order('created_at', { ascending: false });
```

### Caching Strategies
```javascript
// Cache user profile data
const getCachedUserProfile = async (userId) => {
  const cacheKey = `profile:${userId}`;
  let profile = cache.get(cacheKey);
  
  if (!profile) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    profile = data;
    cache.set(cacheKey, profile, 300); // 5 minute cache
  }
  
  return profile;
};
```

## Troubleshooting

### Common Issues
```javascript
// Handle network errors
const safeQuery = async (query) => {
  try {
    const result = await query;
    
    if (result.error) {
      console.error('Supabase error:', result.error);
      return { data: null, error: result.error };
    }
    
    return result;
  } catch (error) {
    console.error('Network error:', error);
    return { data: null, error };
  }
};

// Debug RLS policies
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('RLS might be blocking this query:', error);
}
```

### Setup Verification
```javascript
// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection failed:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```