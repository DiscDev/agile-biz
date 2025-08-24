# Playwright MCP Server Setup Guide

## Overview

The Playwright MCP (Model Context Protocol) server enables the Testing Agent to perform real browser testing with actual browser automation. This integration allows the agent to interact with web applications, validate UI functionality, test user flows, and ensure cross-browser compatibility using real browser instances.

## What This Enables

With Playwright MCP configured, the Testing Agent can:
- 🌐 **Launch real browsers** (Chrome, Firefox, Safari, Edge)
- 🖱️ **Interact with web pages** - click, type, select, hover
- 📸 **Take screenshots** for visual validation
- 🎥 **Record videos** of test execution
- 📱 **Test responsive designs** with different viewports
- 🔍 **Validate page content** and element states
- ⚡ **Execute JavaScript** in browser context
- 🎭 **Test multiple browser contexts** simultaneously
- 🌍 **Test different geolocations** and timezones
- 🔐 **Handle authentication flows** and cookies

## Prerequisites

1. **Node.js 16+**: Required for Playwright
2. **Claude Desktop**: MCP servers work with Claude Desktop app
3. **Sufficient Resources**: Browsers require CPU/RAM for execution
4. **Network Access**: To test deployed applications

## Step 1: Install Playwright MCP Server

### Option A: Using NPX (Recommended)
```bash
# No installation needed, will run directly
npx @cloudflare/playwright-mcp
```

### Option B: Global Installation
```bash
npm install -g @cloudflare/playwright-mcp
```

### Option C: Local Installation (for project-specific setup)
```bash
# In your project directory
npm install @cloudflare/playwright-mcp
```

## Step 2: Configure Claude Desktop

1. **Open Claude Desktop settings**
2. **Navigate to MCP Servers section**
3. **Add Playwright MCP configuration**:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@cloudflare/playwright-mcp"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/path/to/browsers",
        "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "false"
      }
    }
  }
}
```

## Step 3: Update AgileAiAgents .env File

Add Playwright configuration to the `.env` file:

```bash
# Playwright MCP (Testing Agent)
PLAYWRIGHT_MCP_ENABLED=true
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers  # Optional: custom browser location
PLAYWRIGHT_HEADLESS=true                    # true for CI/CD, false for debugging
PLAYWRIGHT_SLOW_MO=0                        # Milliseconds to slow down operations
PLAYWRIGHT_DEFAULT_TIMEOUT=30000            # Default timeout in milliseconds
```

## Available MCP Tools

### Browser Management Tools

#### **playwright_launch**
Launch a new browser instance
```
Parameters:
- browserType: "chromium" | "firefox" | "webkit"
- options: Launch options (headless, args, etc.)
Example: Launch Chrome in headless mode for testing
```

#### **playwright_close**
Close browser instance
```
Example: Clean up browser after test completion
```

### Page Navigation Tools

#### **playwright_navigate**
Navigate to a URL
```
Parameters:
- url: Target URL
- options: Navigation options (timeout, waitUntil)
Example: Navigate to https://example.com and wait for load
```

#### **playwright_reload**
Reload the current page
```
Example: Test page refresh behavior
```

#### **playwright_go_back**
Navigate back in browser history
```
Example: Test browser back button functionality
```

### Element Interaction Tools

#### **playwright_click**
Click on an element
```
Parameters:
- selector: CSS selector, text, or aria label
- options: Click options (button, clickCount, delay)
Example: Click button with text "Submit"
```

#### **playwright_type**
Type text into an input field
```
Parameters:
- selector: Target input element
- text: Text to type
- options: Typing options (delay between keystrokes)
Example: Type "user@example.com" into email field
```

#### **playwright_select**
Select option from dropdown
```
Parameters:
- selector: Select element
- value: Option value(s) to select
Example: Select "United States" from country dropdown
```

#### **playwright_check**
Check or uncheck checkbox/radio
```
Parameters:
- selector: Checkbox or radio button
- checked: true to check, false to uncheck
Example: Check "Accept terms" checkbox
```

### Content Validation Tools

#### **playwright_get_text**
Get text content of element
```
Parameters:
- selector: Target element
Example: Get error message text for validation
```

#### **playwright_get_attribute**
Get element attribute value
```
Parameters:
- selector: Target element
- attribute: Attribute name
Example: Get href of a link
```

#### **playwright_is_visible**
Check if element is visible
```
Parameters:
- selector: Target element
Example: Verify error message is displayed
```

#### **playwright_wait_for_selector**
Wait for element to appear
```
Parameters:
- selector: Target element
- options: Wait options (state, timeout)
Example: Wait for loading spinner to disappear
```

### Advanced Testing Tools

#### **playwright_screenshot**
Take a screenshot
```
Parameters:
- options: Screenshot options (fullPage, path, clip)
Example: Capture full page screenshot for visual regression
```

#### **playwright_evaluate**
Execute JavaScript in page context
```
Parameters:
- expression: JavaScript code to execute
Example: Get localStorage data or trigger custom events
```

#### **playwright_set_viewport**
Set browser viewport size
```
Parameters:
- width: Viewport width
- height: Viewport height
Example: Test mobile responsive design at 375x667
```

## Testing Agent Workflow with Playwright MCP

When the Testing Agent uses Playwright MCP, the typical workflow is:

### 1. **Test Setup**
```
- Launch browser with playwright_launch
- Set viewport for device testing
- Navigate to application URL
- Handle any initial setup (cookies, auth)
```

### 2. **User Flow Testing**
```
- Interact with UI elements (click, type, select)
- Navigate through application flows
- Validate page transitions
- Check element states and content
```

### 3. **Validation & Assertions**
```
- Verify text content matches expectations
- Check element visibility and states
- Validate form submissions
- Ensure error handling works
```

### 4. **Visual Testing**
```
- Take screenshots at key points
- Compare with baseline images
- Document visual regressions
- Test responsive breakpoints
```

### 5. **Cleanup**
```
- Clear test data if needed
- Close browser instances
- Generate test reports
```

## Example Testing Agent Prompts

### Basic UI Testing
```
Acting as the Testing Agent, use the Playwright MCP to:
1. Launch Chrome browser
2. Navigate to our application
3. Test the login flow with valid and invalid credentials
4. Verify error messages appear correctly
5. Take screenshots of each state
```

### Cross-Browser Testing
```
Acting as the Testing Agent, perform cross-browser testing:
1. Test the checkout flow in Chrome, Firefox, and Safari
2. Verify consistent behavior across all browsers
3. Document any browser-specific issues
4. Test responsive design at mobile, tablet, and desktop sizes
```

### Visual Regression Testing
```
Acting as the Testing Agent, perform visual regression testing:
1. Navigate to all major pages
2. Take full-page screenshots
3. Compare with baseline images
4. Flag any visual differences
5. Test dark mode variations
```

## Best Practices

### Test Organization
1. **Use descriptive selectors**: Prefer data-testid attributes
2. **Implement page objects**: Organize selectors and actions
3. **Create reusable workflows**: Common actions like login
4. **Handle waits properly**: Use explicit waits over hard delays
5. **Clean up after tests**: Reset state for next test run

### Performance Optimization
1. **Run headless in CI**: Faster execution without UI
2. **Parallelize tests**: Run multiple browser contexts
3. **Reuse browser contexts**: When possible for speed
4. **Minimize screenshots**: Only capture when necessary
5. **Use efficient selectors**: ID/class over complex XPath

### Debugging
1. **Run headed mode**: See what's happening
2. **Use slow motion**: Add delays between actions
3. **Take screenshots on failure**: Automatic debugging aids
4. **Log browser console**: Capture JavaScript errors
5. **Use Playwright Inspector**: Built-in debugging tool

## Troubleshooting

### "Browser not found" Error
- Run `npx playwright install` to download browsers
- Check PLAYWRIGHT_BROWSERS_PATH is correct
- Ensure sufficient disk space for browsers

### "Timeout waiting for selector" Error
- Increase timeout for slow-loading pages
- Verify selector is correct
- Check if element is in iframe
- Ensure page has finished loading

### "Element not clickable" Error
- Element may be covered by another element
- Wait for animations to complete
- Scroll element into view
- Check z-index issues

### Performance Issues
- Use headless mode for faster execution
- Limit concurrent browser instances
- Close unused pages/contexts
- Monitor system resources

## Integration with AgileAiAgents

Once configured, the Testing Agent will automatically:

1. **Execute browser tests** for all user flows
2. **Validate UI functionality** across browsers
3. **Perform visual regression testing**
4. **Test responsive designs** at various breakpoints
5. **Validate accessibility** with keyboard navigation
6. **Generate test reports** with screenshots

Test results are saved to:
```
agile-ai-agents/project-documents/technical/
├── browser-test-results.md
├── screenshots/
├── visual-regression-report.md
├── cross-browser-compatibility.md
└── test-execution-videos/
```

## Security Considerations

- **Isolate test environments**: Don't test in production
- **Secure test data**: Use dedicated test accounts
- **Clear sensitive data**: Clean cookies/storage after tests
- **Limit browser permissions**: Restrict access as needed
- **Monitor resource usage**: Browsers can consume significant resources

## Advanced Configuration

### Custom Browser Arguments
```javascript
{
  "args": [
    "--disable-web-security",
    "--disable-features=IsolateOrigins",
    "--disable-site-isolation-trials"
  ]
}
```

### Proxy Configuration
```javascript
{
  "proxy": {
    "server": "http://proxy.example.com:8080",
    "username": "user",
    "password": "pass"
  }
}
```

### Device Emulation
```javascript
{
  "devices": ["iPhone 13", "iPad Pro", "Pixel 5"]
}
```

## Additional Resources

- **MCP Server Documentation**: https://smithery.ai/server/@cloudflare/playwright-mcp
- **Available Tools**: https://smithery.ai/server/@cloudflare/playwright-mcp/tools
- **API Reference**: https://smithery.ai/server/@cloudflare/playwright-mcp/api
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Playwright Best Practices**: https://playwright.dev/docs/best-practices

This integration transforms the Testing Agent into a powerful browser automation expert, capable of comprehensive UI testing across all browsers and devices!