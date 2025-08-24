# Supabase MCP Server Setup Guide

## Overview

The Supabase MCP (Model Context Protocol) server enables the Coder, DevOps, and API agents to interact directly with Supabase - an open-source Firebase alternative that provides database, authentication, storage, and real-time capabilities. This integration allows agents to manage database schemas, handle authentication, work with storage, and implement real-time features.

## What This Enables

With Supabase MCP configured, agents can:
- 🗄️ **Manage PostgreSQL databases** - Create tables, run queries, handle migrations
- 🔐 **Implement authentication** - User management, auth flows, JWT tokens
- 📁 **Handle file storage** - Upload/download files, manage buckets
- ⚡ **Real-time subscriptions** - Live data updates, presence, broadcasts
- 🔑 **Row Level Security (RLS)** - Fine-grained access control
- 📊 **Database functions** - Stored procedures, triggers, views
- 🌍 **Edge Functions** - Serverless functions at the edge
- 📈 **Vector embeddings** - AI/ML capabilities with pgvector
- 🔄 **Database migrations** - Version control for database schemas
- 📱 **Multi-platform support** - Web, mobile, and server SDKs

## Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Supabase Project**: Create a new project or use existing
3. **API Credentials**: Project URL and API keys
4. **Claude Desktop**: MCP servers work with Claude Desktop app
5. **PostgreSQL Knowledge**: Basic understanding helpful but not required

## Step 1: Set Up Supabase Project

1. **Sign up for Supabase** at https://supabase.com
2. **Create a new project**:
   - Choose a project name
   - Set a strong database password
   - Select your region (closest for best performance)
   - Wait for project provisioning (~2 minutes)
3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your:
     - **Project URL**: `https://[PROJECT_REF].supabase.co`
     - **Anon Key**: Public API key for client-side
     - **Service Role Key**: Private key for server-side (keep secret!)

## Step 2: Install Supabase MCP Server

### Option A: Using NPX (Recommended)
```bash
# No installation needed, will run directly
npx @supabase-community/supabase-mcp
```

### Option B: Global Installation
```bash
npm install -g @supabase-community/supabase-mcp
```

### Option C: Local Installation
```bash
# In your project directory
npm install @supabase-community/supabase-mcp
```

## Step 3: Configure Claude Desktop

1. **Open Claude Desktop settings**
2. **Navigate to MCP Servers section**
3. **Add Supabase MCP configuration**:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase-community/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://[PROJECT_REF].supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

## Step 4: Update AgileAiAgents .env File

Add Supabase configuration to the `.env` file:

```bash
# Supabase MCP (Coder, DevOps, API Agents)
SUPABASE_MCP_ENABLED=true
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_DATABASE_PASSWORD=your-database-password
```

## Available MCP Tools

### Database Management Tools

#### **supabase_create_table**
Create a new database table
```
Parameters:
- name: Table name
- columns: Column definitions with types
- primaryKey: Primary key column(s)
Example: Create users table with id, email, created_at
```

#### **supabase_query**
Execute SQL queries
```
Parameters:
- query: SQL query string
- params: Query parameters (optional)
Example: SELECT * FROM users WHERE active = true
```

#### **supabase_insert**
Insert data into tables
```
Parameters:
- table: Table name
- data: Object or array of objects to insert
- options: Insert options (returning, onConflict, etc.)
Example: Insert new user record
```

#### **supabase_update**
Update existing records
```
Parameters:
- table: Table name
- data: Update values
- filter: WHERE conditions
Example: Update user profile information
```

#### **supabase_delete**
Delete records from tables
```
Parameters:
- table: Table name
- filter: WHERE conditions
Example: Delete inactive users
```

#### **supabase_select**
Query data with filters
```
Parameters:
- table: Table name
- columns: Columns to select
- filter: Query conditions
- options: Order, limit, offset
Example: Get paginated list of products
```

### Authentication Tools

#### **supabase_create_user**
Create new user account
```
Parameters:
- email: User email
- password: User password
- metadata: Additional user data
Example: Register new user with profile
```

#### **supabase_update_user**
Update user information
```
Parameters:
- userId: User ID
- updates: Email, password, metadata
Example: Update user profile data
```

#### **supabase_delete_user**
Delete user account
```
Parameters:
- userId: User ID to delete
Example: Remove user and associated data
```

#### **supabase_list_users**
Get list of users
```
Parameters:
- filter: Filter conditions
- page: Pagination options
Example: Get all active users
```

### Storage Tools

#### **supabase_upload_file**
Upload file to storage
```
Parameters:
- bucket: Storage bucket name
- path: File path in bucket
- file: File data or path
- options: Content type, cache control
Example: Upload user avatar image
```

#### **supabase_download_file**
Download file from storage
```
Parameters:
- bucket: Storage bucket name
- path: File path in bucket
Example: Retrieve uploaded document
```

#### **supabase_delete_file**
Delete file from storage
```
Parameters:
- bucket: Storage bucket name
- paths: File path(s) to delete
Example: Remove old profile pictures
```

#### **supabase_list_files**
List files in bucket
```
Parameters:
- bucket: Storage bucket name
- path: Directory path (optional)
- options: Search, limit, offset
Example: Get all images in user folder
```

### Real-time Tools

#### **supabase_subscribe**
Subscribe to real-time changes
```
Parameters:
- table: Table to watch
- event: INSERT, UPDATE, DELETE, *
- filter: Optional conditions
Example: Watch for new messages in chat
```

#### **supabase_broadcast**
Send real-time broadcast
```
Parameters:
- channel: Channel name
- event: Event type
- payload: Data to broadcast
Example: Notify users of system update
```

### Advanced Tools

#### **supabase_rpc**
Call database functions
```
Parameters:
- functionName: RPC function name
- params: Function parameters
Example: Call calculate_order_total function
```

#### **supabase_create_policy**
Create Row Level Security policy
```
Parameters:
- table: Table name
- name: Policy name
- definition: Policy SQL
Example: Users can only see own records
```

## Agent Workflows with Supabase MCP

### For Coder Agent - Application Development

1. **Database Schema Design**
   ```
   - Create tables with supabase_create_table
   - Set up relationships and constraints
   - Implement indexes for performance
   - Create views for complex queries
   ```

2. **API Development**
   ```
   - Use supabase_select for data retrieval
   - Implement CRUD operations
   - Handle pagination and filtering
   - Optimize queries for performance
   ```

3. **Authentication Implementation**
   ```
   - Create user registration with supabase_create_user
   - Implement login/logout flows
   - Handle password resets
   - Manage user sessions and JWT tokens
   ```

4. **Real-time Features**
   ```
   - Set up subscriptions for live updates
   - Implement presence for online users
   - Create broadcast channels
   - Handle real-time collaboration
   ```

### For DevOps Agent - Infrastructure Management

1. **Database Management**
   ```
   - Run migrations with supabase_query
   - Set up backup strategies
   - Monitor database performance
   - Implement connection pooling
   ```

2. **Security Configuration**
   ```
   - Create RLS policies with supabase_create_policy
   - Set up API rate limiting
   - Configure CORS settings
   - Implement security best practices
   ```

3. **Performance Optimization**
   ```
   - Create database indexes
   - Optimize query performance
   - Configure caching strategies
   - Monitor resource usage
   ```

### For API Agent - Integration Development

1. **RESTful API Design**
   ```
   - Design API endpoints using Supabase
   - Implement data validation
   - Handle error responses
   - Create API documentation
   ```

2. **Third-party Integrations**
   ```
   - Connect external services
   - Implement webhooks
   - Handle data synchronization
   - Manage API keys securely
   ```

## Example Agent Prompts

### Database Schema Creation
```
Acting as the Coder Agent, use Supabase MCP to:
1. Create a database schema for our e-commerce platform
2. Set up tables for users, products, orders, and reviews
3. Implement proper relationships and constraints
4. Create indexes for optimal query performance
```

### Authentication System
```
Acting as the Coder Agent, implement authentication:
1. Create user registration and login endpoints
2. Set up email verification flow
3. Implement password reset functionality
4. Configure JWT token management
```

### Real-time Chat Feature
```
Acting as the Coder Agent, build real-time chat:
1. Create messages table with proper schema
2. Set up real-time subscriptions for new messages
3. Implement presence for online users
4. Add typing indicators using broadcasts
```

## Best Practices

### Database Design
1. **Use proper data types**: Choose appropriate PostgreSQL types
2. **Implement constraints**: Add NOT NULL, UNIQUE, CHECK constraints
3. **Create indexes**: Index frequently queried columns
4. **Normalize data**: Follow database normalization principles
5. **Plan for scale**: Design with growth in mind

### Security
1. **Enable RLS**: Always use Row Level Security
2. **Use service key carefully**: Only server-side, never expose
3. **Validate input**: Sanitize all user inputs
4. **Implement rate limiting**: Protect against abuse
5. **Audit access**: Log sensitive operations

### Performance
1. **Optimize queries**: Use EXPLAIN ANALYZE
2. **Batch operations**: Reduce database round trips
3. **Use connection pooling**: Manage connections efficiently
4. **Cache when possible**: Reduce database load
5. **Monitor metrics**: Track query performance

## Troubleshooting

### "Permission denied" Error
- Check RLS policies are properly configured
- Verify using correct API key (anon vs service role)
- Ensure user has proper permissions
- Check table/column permissions

### "Connection failed" Error
- Verify Supabase URL is correct
- Check API keys are valid
- Ensure project is active (not paused)
- Verify network connectivity

### "Query timeout" Error
- Optimize complex queries
- Add appropriate indexes
- Consider pagination for large datasets
- Check for missing WHERE clauses

### Performance Issues
- Review query execution plans
- Add database indexes
- Implement caching strategies
- Consider connection pooling
- Monitor database metrics

## Integration with AgileAiAgents

Once configured, agents will automatically:

### Coder Agent
1. **Design and implement** database schemas
2. **Create API endpoints** with Supabase client
3. **Implement authentication** and authorization
4. **Build real-time features** for collaboration
5. **Optimize database** queries and performance

### DevOps Agent
1. **Manage database** migrations and backups
2. **Configure security** policies and access control
3. **Monitor performance** and resource usage
4. **Set up environments** for dev/staging/prod
5. **Implement CI/CD** with database migrations

### API Agent
1. **Design RESTful APIs** using Supabase
2. **Create GraphQL endpoints** if needed
3. **Implement webhooks** for integrations
4. **Handle data sync** with external services
5. **Document API endpoints** and usage

Results are saved to:
```
agile-ai-agents/project-documents/
├── 10-environment/
│   ├── database-schema.sql
│   ├── migration-scripts/
│   └── supabase-config.md
├── 13-implementation/
│   ├── api-endpoints.md
│   ├── auth-implementation.md
│   └── real-time-features.md
└── 15-deployment/
    ├── production-setup.md
    └── security-policies.md
```

## Security Considerations

- **Never expose service role key**: Use only server-side
- **Enable RLS**: Mandatory for production
- **Rotate keys regularly**: Update API keys periodically
- **Use environment variables**: Never hardcode credentials
- **Implement rate limiting**: Protect against abuse
- **Audit database access**: Log sensitive operations
- **Backup regularly**: Implement backup strategy

## Advanced Features

### Vector Embeddings (AI/ML)
```sql
-- Enable pgvector extension
CREATE EXTENSION vector;

-- Create embeddings table
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- Search by similarity
SELECT * FROM embeddings
ORDER BY embedding <-> '[0.1, 0.2, ...]'
LIMIT 10;
```

### Edge Functions
```typescript
// supabase/functions/hello/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  return new Response(
    JSON.stringify({ message: "Hello from Edge Function!" }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### Database Functions
```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_id INT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT SUM(quantity * price)
    FROM order_items
    WHERE order_id = $1
  );
END;
$$ LANGUAGE plpgsql;
```

## Additional Resources

- **MCP Server Documentation**: https://smithery.ai/server/@supabase-community/supabase-mcp
- **Available Tools**: https://smithery.ai/server/@supabase-community/supabase-mcp/tools
- **API Reference**: https://smithery.ai/server/@supabase-community/supabase-mcp/api
- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

This integration transforms the Coder, DevOps, and API agents into powerful backend developers with full database, authentication, storage, and real-time capabilities!