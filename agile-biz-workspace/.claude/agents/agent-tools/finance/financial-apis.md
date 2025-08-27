# Financial APIs and Data Integration - Finance Agent

## Market Data Integration

### Real-Time Market Data Feeds

#### Stock Market Data Integration
```python
import asyncio
import websocket
from datetime import datetime

class MarketDataFeed:
    def __init__(self, provider='alpha_vantage'):
        self.provider = provider
        self.api_endpoints = {
            'alpha_vantage': 'https://www.alphavantage.co/query',
            'yahoo_finance': 'https://query1.finance.yahoo.com/v8/finance',
            'iex_cloud': 'https://cloud.iexapis.com/stable',
            'polygon': 'wss://socket.polygon.io',
            'finnhub': 'wss://ws.finnhub.io'
        }
        self.connections = {}
    
    async def connect_websocket(self, symbols):
        """Connect to real-time market data websocket"""
        if self.provider == 'polygon':
            ws_url = f"{self.api_endpoints['polygon']}/stocks"
            
            async def on_message(ws, message):
                data = self.parse_market_data(message)
                await self.process_market_data(data)
            
            async def on_error(ws, error):
                await self.handle_connection_error(error)
                await self.reconnect()
            
            ws = websocket.WebSocketApp(
                ws_url,
                on_message=on_message,
                on_error=on_error
            )
            
            # Subscribe to symbols
            for symbol in symbols:
                subscription = {
                    'action': 'subscribe',
                    'params': f'T.{symbol},Q.{symbol},A.{symbol}'
                }
                ws.send(json.dumps(subscription))
            
            self.connections[self.provider] = ws
            ws.run_forever()
    
    def get_quote(self, symbol):
        """Get real-time quote data"""
        if self.provider == 'alpha_vantage':
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.api_key
            }
            response = requests.get(self.api_endpoints[self.provider], params=params)
            return self.parse_quote(response.json())
        
        elif self.provider == 'iex_cloud':
            url = f"{self.api_endpoints['iex_cloud']}/stock/{symbol}/quote"
            params = {'token': self.api_key}
            response = requests.get(url, params=params)
            return self.parse_iex_quote(response.json())
    
    def get_historical_data(self, symbol, start_date, end_date, interval='1d'):
        """Fetch historical price data"""
        if self.provider == 'yahoo_finance':
            url = f"{self.api_endpoints['yahoo_finance']}/chart/{symbol}"
            params = {
                'period1': int(start_date.timestamp()),
                'period2': int(end_date.timestamp()),
                'interval': interval
            }
            response = requests.get(url, params=params)
            return self.parse_historical_data(response.json())
```

#### Cryptocurrency Data Feeds
```javascript
class CryptoDataFeed {
    constructor() {
        this.exchanges = {
            binance: {
                rest: 'https://api.binance.com/api/v3',
                ws: 'wss://stream.binance.com:9443/ws'
            },
            coinbase: {
                rest: 'https://api.exchange.coinbase.com',
                ws: 'wss://ws-feed.exchange.coinbase.com'
            },
            kraken: {
                rest: 'https://api.kraken.com/0',
                ws: 'wss://ws.kraken.com'
            }
        };
        this.subscriptions = new Map();
    }
    
    async connectCoinbase(products) {
        const ws = new WebSocket(this.exchanges.coinbase.ws);
        
        ws.on('open', () => {
            const subscribe = {
                type: 'subscribe',
                product_ids: products,
                channels: [
                    'ticker',
                    'level2',
                    'matches',
                    'full'
                ]
            };
            ws.send(JSON.stringify(subscribe));
        });
        
        ws.on('message', (data) => {
            const message = JSON.parse(data);
            this.processMessage(message);
        });
        
        ws.on('error', (error) => {
            console.error('Coinbase WebSocket error:', error);
            this.reconnectWithBackoff('coinbase');
        });
        
        this.subscriptions.set('coinbase', ws);
    }
    
    async getOrderBook(exchange, pair) {
        if (exchange === 'binance') {
            const url = `${this.exchanges.binance.rest}/depth`;
            const params = { symbol: pair, limit: 100 };
            const response = await fetch(`${url}?${new URLSearchParams(params)}`);
            return this.parseBinanceOrderBook(await response.json());
        }
    }
    
    aggregateMarketData(symbol) {
        const aggregated = {
            symbol: symbol,
            timestamp: Date.now(),
            exchanges: {},
            bestBid: { price: 0, size: 0, exchange: null },
            bestAsk: { price: Infinity, size: 0, exchange: null },
            volumeWeightedPrice: 0
        };
        
        let totalVolume = 0;
        let volumeWeightedSum = 0;
        
        for (let [exchange, data] of this.marketData.entries()) {
            if (data[symbol]) {
                aggregated.exchanges[exchange] = data[symbol];
                
                // Update best bid/ask
                if (data[symbol].bid > aggregated.bestBid.price) {
                    aggregated.bestBid = {
                        price: data[symbol].bid,
                        size: data[symbol].bidSize,
                        exchange: exchange
                    };
                }
                
                if (data[symbol].ask < aggregated.bestAsk.price) {
                    aggregated.bestAsk = {
                        price: data[symbol].ask,
                        size: data[symbol].askSize,
                        exchange: exchange
                    };
                }
                
                // Calculate VWAP
                totalVolume += data[symbol].volume;
                volumeWeightedSum += data[symbol].price * data[symbol].volume;
            }
        }
        
        aggregated.volumeWeightedPrice = volumeWeightedSum / totalVolume;
        return aggregated;
    }
}
```

### Financial Data APIs

#### Banking and Account Aggregation
```python
class BankingAPIIntegration:
    def __init__(self):
        self.providers = {
            'plaid': PlaidClient(),
            'yodlee': YodleeClient(),
            'mx': MXClient(),
            'finicity': FinicityClient()
        }
    
    def connect_bank_account(self, provider, credentials):
        """Connect to bank account via aggregation API"""
        if provider == 'plaid':
            return self.connect_plaid(credentials)
        elif provider == 'yodlee':
            return self.connect_yodlee(credentials)
    
    def connect_plaid(self, public_token):
        """Connect using Plaid API"""
        from plaid import Client
        
        client = Client(
            client_id=self.plaid_client_id,
            secret=self.plaid_secret,
            environment=self.plaid_env
        )
        
        # Exchange public token for access token
        exchange_response = client.Item.public_token.exchange(public_token)
        access_token = exchange_response['access_token']
        
        # Get accounts
        accounts_response = client.Accounts.get(access_token)
        accounts = accounts_response['accounts']
        
        # Get transactions
        start_date = (datetime.now() - timedelta(days=30)).date()
        end_date = datetime.now().date()
        
        transactions_response = client.Transactions.get(
            access_token,
            start_date,
            end_date
        )
        
        return {
            'accounts': self.parse_plaid_accounts(accounts),
            'transactions': self.parse_plaid_transactions(
                transactions_response['transactions']
            ),
            'access_token': access_token
        }
    
    def get_account_balances(self, provider, access_token):
        """Fetch current account balances"""
        if provider == 'plaid':
            client = self.providers['plaid']
            response = client.Accounts.get(access_token)
            
            balances = []
            for account in response['accounts']:
                balances.append({
                    'account_id': account['account_id'],
                    'name': account['name'],
                    'type': account['type'],
                    'subtype': account['subtype'],
                    'current_balance': account['balances']['current'],
                    'available_balance': account['balances']['available'],
                    'currency': account['balances']['iso_currency_code']
                })
            
            return balances
    
    def categorize_transactions(self, transactions):
        """Categorize transactions for financial analysis"""
        categorized = {
            'income': [],
            'expenses': {
                'fixed': [],
                'variable': [],
                'discretionary': []
            },
            'transfers': [],
            'investments': []
        }
        
        for transaction in transactions:
            category = self.determine_category(transaction)
            
            if category == 'income':
                categorized['income'].append(transaction)
            elif category == 'transfer':
                categorized['transfers'].append(transaction)
            elif category == 'investment':
                categorized['investments'].append(transaction)
            else:
                expense_type = self.determine_expense_type(transaction)
                categorized['expenses'][expense_type].append(transaction)
        
        return categorized
```

#### Payment Processing Integration
```javascript
const paymentProcessing = {
    stripe: {
        async initializeClient() {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            return stripe;
        },
        
        async processPayment(amount, currency, paymentMethod) {
            const stripe = await this.initializeClient();
            
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: currency,
                    payment_method: paymentMethod,
                    confirm: true,
                    capture_method: 'automatic',
                    metadata: {
                        integration: 'finance_agent',
                        timestamp: Date.now()
                    }
                });
                
                return {
                    success: true,
                    transactionId: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    status: paymentIntent.status,
                    receipt: paymentIntent.receipt_url
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code
                };
            }
        },
        
        async createSubscription(customerId, priceId) {
            const stripe = await this.initializeClient();
            
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                expand: ['latest_invoice.payment_intent']
            });
            
            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                currentPeriod: {
                    start: new Date(subscription.current_period_start * 1000),
                    end: new Date(subscription.current_period_end * 1000)
                },
                invoice: subscription.latest_invoice
            };
        },
        
        async getPaymentAnalytics(startDate, endDate) {
            const stripe = await this.initializeClient();
            
            // Fetch charges
            const charges = await stripe.charges.list({
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                    lte: Math.floor(endDate.getTime() / 1000)
                },
                limit: 100
            });
            
            // Analyze payment data
            const analytics = {
                totalRevenue: 0,
                transactionCount: 0,
                averageTransaction: 0,
                byStatus: {},
                byCurrency: {},
                byPaymentMethod: {}
            };
            
            charges.data.forEach(charge => {
                analytics.totalRevenue += charge.amount / 100;
                analytics.transactionCount++;
                
                // Group by status
                analytics.byStatus[charge.status] = 
                    (analytics.byStatus[charge.status] || 0) + 1;
                
                // Group by currency
                analytics.byCurrency[charge.currency] = 
                    (analytics.byCurrency[charge.currency] || 0) + charge.amount / 100;
                
                // Group by payment method
                const method = charge.payment_method_details?.type || 'unknown';
                analytics.byPaymentMethod[method] = 
                    (analytics.byPaymentMethod[method] || 0) + 1;
            });
            
            analytics.averageTransaction = 
                analytics.totalRevenue / analytics.transactionCount;
            
            return analytics;
        }
    },
    
    square: {
        async processPayment(amount, sourceId, locationId) {
            const { Client, Environment } = require('square');
            
            const client = new Client({
                accessToken: process.env.SQUARE_ACCESS_TOKEN,
                environment: Environment.Production
            });
            
            const paymentsApi = client.paymentsApi;
            
            const payment = {
                sourceId: sourceId,
                idempotencyKey: this.generateIdempotencyKey(),
                amountMoney: {
                    amount: Math.round(amount * 100),
                    currency: 'USD'
                },
                locationId: locationId
            };
            
            const response = await paymentsApi.createPayment(payment);
            
            return {
                success: response.result.payment.status === 'COMPLETED',
                transactionId: response.result.payment.id,
                receiptUrl: response.result.payment.receiptUrl
            };
        }
    }
};
```

### Accounting System Integration

#### ERP System Connectors
```python
class ERPIntegration:
    def __init__(self):
        self.connectors = {
            'sap': SAPConnector(),
            'oracle': OracleConnector(),
            'netsuite': NetSuiteConnector(),
            'quickbooks': QuickBooksConnector(),
            'xero': XeroConnector()
        }
    
    def sync_general_ledger(self, erp_system, date_range):
        """Sync general ledger data from ERP"""
        if erp_system == 'quickbooks':
            return self.sync_quickbooks_gl(date_range)
        elif erp_system == 'netsuite':
            return self.sync_netsuite_gl(date_range)
    
    def sync_quickbooks_gl(self, date_range):
        """QuickBooks Online integration"""
        from quickbooks import QuickBooks
        
        qb_client = QuickBooks(
            client_id=self.qb_client_id,
            client_secret=self.qb_client_secret,
            access_token=self.qb_access_token,
            company_id=self.qb_company_id
        )
        
        # Fetch GL accounts
        accounts = qb_client.query(
            "SELECT * FROM Account WHERE Active = true"
        )
        
        # Fetch transactions
        gl_entries = []
        for account in accounts:
            transactions = qb_client.query(f"""
                SELECT * FROM GeneralLedger 
                WHERE AccountRef = '{account.Id}' 
                AND TxnDate >= '{date_range['start']}' 
                AND TxnDate <= '{date_range['end']}'
            """)
            
            for txn in transactions:
                gl_entries.append({
                    'date': txn.TxnDate,
                    'account_code': account.AcctNum,
                    'account_name': account.Name,
                    'debit': txn.Debit or 0,
                    'credit': txn.Credit or 0,
                    'description': txn.Desc,
                    'reference': txn.DocNumber
                })
        
        return self.process_gl_entries(gl_entries)
    
    def sync_netsuite_gl(self, date_range):
        """NetSuite integration via SuiteTalk API"""
        import zeep
        
        # Initialize SOAP client
        wsdl_url = f"{self.netsuite_endpoint}/wsdl/v2021_2_0/netsuite.wsdl"
        client = zeep.Client(wsdl=wsdl_url)
        
        # Set authentication
        passport = {
            'email': self.netsuite_email,
            'password': self.netsuite_password,
            'account': self.netsuite_account,
            'role': {'internalId': self.netsuite_role_id}
        }
        
        # Search for transactions
        search_criteria = {
            'basic': {
                'tranDate': {
                    'operator': 'within',
                    'searchValue': date_range['start'],
                    'searchValue2': date_range['end']
                }
            }
        }
        
        response = client.service.search(
            searchRecord={'type': 'transaction', 'searchBasic': search_criteria}
        )
        
        return self.parse_netsuite_transactions(response)
```

### Economic Data and Indicators

#### Federal Reserve Economic Data (FRED)
```javascript
class EconomicDataAPI {
    constructor() {
        this.fredApiKey = process.env.FRED_API_KEY;
        this.fredBaseUrl = 'https://api.stlouisfed.org/fred';
        this.worldBankUrl = 'https://api.worldbank.org/v2';
        this.cache = new Map();
    }
    
    async getFREDSeries(seriesId, startDate, endDate) {
        const cacheKey = `${seriesId}_${startDate}_${endDate}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const url = `${this.fredBaseUrl}/series/observations`;
        const params = {
            series_id: seriesId,
            api_key: this.fredApiKey,
            file_type: 'json',
            observation_start: startDate,
            observation_end: endDate
        };
        
        const response = await fetch(`${url}?${new URLSearchParams(params)}`);
        const data = await response.json();
        
        const processed = {
            series: seriesId,
            observations: data.observations.map(obs => ({
                date: obs.date,
                value: parseFloat(obs.value)
            })),
            metadata: {
                units: data.units,
                frequency: data.frequency,
                lastUpdated: data.last_updated
            }
        };
        
        // Cache for 1 hour
        this.cache.set(cacheKey, processed);
        setTimeout(() => this.cache.delete(cacheKey), 3600000);
        
        return processed;
    }
    
    async getEconomicIndicators() {
        const indicators = {
            gdp: await this.getFREDSeries('GDP', '2020-01-01', 'current'),
            unemployment: await this.getFREDSeries('UNRATE', '2020-01-01', 'current'),
            inflation: await this.getFREDSeries('CPIAUCSL', '2020-01-01', 'current'),
            federalFundsRate: await this.getFREDSeries('DFF', '2020-01-01', 'current'),
            tenYearTreasury: await this.getFREDSeries('DGS10', '2020-01-01', 'current'),
            vix: await this.getFREDSeries('VIXCLS', '2020-01-01', 'current'),
            dollarIndex: await this.getFREDSeries('DTWEXBGS', '2020-01-01', 'current')
        };
        
        return this.calculateEconomicMetrics(indicators);
    }
    
    calculateEconomicMetrics(indicators) {
        const metrics = {
            gdpGrowth: this.calculateGrowthRate(indicators.gdp.observations),
            realInterestRate: this.calculateRealRate(
                indicators.federalFundsRate,
                indicators.inflation
            ),
            yieldCurve: this.calculateYieldSpread(
                indicators.tenYearTreasury,
                indicators.federalFundsRate
            ),
            economicMomentum: this.assessEconomicMomentum(indicators),
            recessionProbability: this.calculateRecessionProbability(indicators)
        };
        
        return metrics;
    }
}
```

### Alternative Data Sources

#### Social Sentiment Analysis
```python
class SocialSentimentAPI:
    def __init__(self):
        self.twitter_api = TwitterAPI()
        self.reddit_api = RedditAPI()
        self.news_api = NewsAPI()
    
    def analyze_twitter_sentiment(self, ticker, time_range='24h'):
        """Analyze Twitter sentiment for a ticker"""
        import tweepy
        from textblob import TextBlob
        
        # Initialize Twitter client
        auth = tweepy.OAuthHandler(self.consumer_key, self.consumer_secret)
        auth.set_access_token(self.access_token, self.access_token_secret)
        api = tweepy.API(auth)
        
        # Search tweets
        query = f"${ticker} OR #{ticker}"
        tweets = api.search_tweets(q=query, count=100, lang='en')
        
        sentiment_scores = []
        for tweet in tweets:
            # Clean tweet text
            clean_text = self.clean_tweet(tweet.text)
            
            # Analyze sentiment
            analysis = TextBlob(clean_text)
            sentiment_scores.append({
                'text': clean_text,
                'polarity': analysis.sentiment.polarity,
                'subjectivity': analysis.sentiment.subjectivity,
                'timestamp': tweet.created_at,
                'retweets': tweet.retweet_count,
                'likes': tweet.favorite_count
            })
        
        # Calculate aggregate metrics
        avg_sentiment = sum(s['polarity'] for s in sentiment_scores) / len(sentiment_scores)
        weighted_sentiment = sum(
            s['polarity'] * (1 + s['retweets'] + s['likes']) 
            for s in sentiment_scores
        ) / sum(1 + s['retweets'] + s['likes'] for s in sentiment_scores)
        
        return {
            'ticker': ticker,
            'sample_size': len(sentiment_scores),
            'average_sentiment': avg_sentiment,
            'weighted_sentiment': weighted_sentiment,
            'sentiment_distribution': self.calculate_distribution(sentiment_scores),
            'trending_score': self.calculate_trending_score(tweets)
        }
    
    def analyze_reddit_sentiment(self, ticker):
        """Analyze Reddit sentiment from WSB and investing subreddits"""
        import praw
        
        reddit = praw.Reddit(
            client_id=self.reddit_client_id,
            client_secret=self.reddit_client_secret,
            user_agent=self.reddit_user_agent
        )
        
        subreddits = ['wallstreetbets', 'stocks', 'investing', 'StockMarket']
        posts_data = []
        
        for subreddit_name in subreddits:
            subreddit = reddit.subreddit(subreddit_name)
            
            # Search for ticker mentions
            for post in subreddit.search(ticker, limit=25, time_filter='day'):
                posts_data.append({
                    'title': post.title,
                    'text': post.selftext,
                    'score': post.score,
                    'comments': post.num_comments,
                    'created': datetime.fromtimestamp(post.created_utc),
                    'subreddit': subreddit_name
                })
        
        return self.aggregate_reddit_sentiment(posts_data, ticker)
```

### Data Quality and Validation

#### Data Validation Framework
```javascript
const dataValidation = {
    validateMarketData(data) {
        const validations = {
            completeness: this.checkCompleteness(data),
            accuracy: this.checkAccuracy(data),
            timeliness: this.checkTimeliness(data),
            consistency: this.checkConsistency(data)
        };
        
        const issues = [];
        
        // Check for missing data
        if (!validations.completeness.passed) {
            issues.push({
                type: 'missing_data',
                severity: 'high',
                details: validations.completeness.missing
            });
        }
        
        // Check for outliers
        if (!validations.accuracy.passed) {
            issues.push({
                type: 'outliers',
                severity: 'medium',
                details: validations.accuracy.outliers
            });
        }
        
        // Check for stale data
        if (!validations.timeliness.passed) {
            issues.push({
                type: 'stale_data',
                severity: 'high',
                details: validations.timeliness.stale
            });
        }
        
        return {
            valid: issues.length === 0,
            issues: issues,
            qualityScore: this.calculateQualityScore(validations)
        };
    },
    
    reconcileDataSources(sources) {
        const reconciliation = {
            matched: [],
            discrepancies: [],
            missing: []
        };
        
        // Compare data across sources
        const primarySource = sources[0];
        const secondarySources = sources.slice(1);
        
        for (let record of primarySource.data) {
            let matched = true;
            let discrepancyDetails = [];
            
            for (let secondary of secondarySources) {
                const matchingRecord = secondary.data.find(
                    r => r.id === record.id && r.date === record.date
                );
                
                if (!matchingRecord) {
                    reconciliation.missing.push({
                        record: record,
                        missingFrom: secondary.name
                    });
                    matched = false;
                } else {
                    // Check for value discrepancies
                    const tolerance = 0.001; // 0.1% tolerance
                    
                    if (Math.abs(record.value - matchingRecord.value) / record.value > tolerance) {
                        discrepancyDetails.push({
                            source: secondary.name,
                            primaryValue: record.value,
                            secondaryValue: matchingRecord.value,
                            difference: record.value - matchingRecord.value
                        });
                        matched = false;
                    }
                }
            }
            
            if (matched) {
                reconciliation.matched.push(record);
            } else if (discrepancyDetails.length > 0) {
                reconciliation.discrepancies.push({
                    record: record,
                    discrepancies: discrepancyDetails
                });
            }
        }
        
        return reconciliation;
    }
};
```

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)