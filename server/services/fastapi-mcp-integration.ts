/**
 * WAI DevStudio - FastAPI MCP Integration
 * Model Context Protocol (MCP) server using FastAPI for Python-based AI tools
 * Supports Python execution, ML models, data processing, and scientific computing
 */

export interface FastAPIMCPConfig {
  host: string;
  port: number;
  pythonPath: string;
  virtualEnv?: string;
  enableCors: boolean;
  enableDocs: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}

export interface PythonTool {
  name: string;
  description: string;
  inputSchema: any;
  pythonCode: string;
  requirements: string[];
  category: 'data' | 'ml' | 'computation' | 'visualization' | 'io' | 'web';
  timeout: number;
  memoryLimit: number;
}

export interface PythonEnvironment {
  id: string;
  name: string;
  pythonVersion: string;
  packages: Array<{
    name: string;
    version: string;
    installed: boolean;
  }>;
  requirements: string;
  status: 'active' | 'installing' | 'error';
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  returnValue?: any;
  plots?: Array<{
    format: 'png' | 'svg' | 'html';
    data: string;
    title?: string;
  }>;
}

export interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'cv' | 'custom';
  framework: 'sklearn' | 'tensorflow' | 'pytorch' | 'xgboost' | 'lightgbm' | 'custom';
  status: 'training' | 'trained' | 'deployed' | 'error';
  accuracy?: number;
  modelPath: string;
  metadata: Record<string, any>;
}

export class FastAPIMCPService {
  private config: FastAPIMCPConfig;
  private pythonTools: Map<string, PythonTool> = new Map();
  private environments: Map<string, PythonEnvironment> = new Map();
  private mlModels: Map<string, MLModel> = new Map();
  private server: any = null;
  private executionHistory: Array<{
    toolName: string;
    input: any;
    result: ExecutionResult;
    timestamp: Date;
  }> = [];

  constructor(config?: Partial<FastAPIMCPConfig>) {
    this.config = {
      host: '0.0.0.0',
      port: 8001,
      pythonPath: 'python3',
      enableCors: true,
      enableDocs: true,
      logLevel: 'info',
      ...config
    };

    this.initializeFastAPIMCP();
  }

  /**
   * Initialize FastAPI MCP server with Python tools
   */
  private initializeFastAPIMCP(): void {
    this.setupPythonEnvironments();
    this.registerDefaultPythonTools();
    this.setupMLModels();
    console.log('🐍 FastAPI MCP service initialized');
  }

  /**
   * Setup Python environments
   */
  private setupPythonEnvironments(): void {
    // Default data science environment
    this.environments.set('datascience', {
      id: 'datascience',
      name: 'Data Science Environment',
      pythonVersion: '3.9',
      packages: [
        { name: 'numpy', version: '1.21.0', installed: true },
        { name: 'pandas', version: '1.3.0', installed: true },
        { name: 'matplotlib', version: '3.4.2', installed: true },
        { name: 'seaborn', version: '0.11.1', installed: true },
        { name: 'scikit-learn', version: '1.0.0', installed: true },
        { name: 'jupyter', version: '1.0.0', installed: true }
      ],
      requirements: 'numpy>=1.21.0\npandas>=1.3.0\nmatplotlib>=3.4.2\nseaborn>=0.11.1\nscikit-learn>=1.0.0\njupyter>=1.0.0',
      status: 'active'
    });

    // Machine Learning environment
    this.environments.set('ml', {
      id: 'ml',
      name: 'Machine Learning Environment',
      pythonVersion: '3.9',
      packages: [
        { name: 'tensorflow', version: '2.7.0', installed: true },
        { name: 'pytorch', version: '1.0', installed: true },
        { name: 'transformers', version: '4.12.0', installed: true },
        { name: 'xgboost', version: '1.5.0', installed: true },
        { name: 'lightgbm', version: '3.3.0', installed: true }
      ],
      requirements: 'tensorflow>=2.7.0\ntorch>=1.10.0\ntransformers>=4.12.0\nxgboost>=1.5.0\nlightgbm>=3.3.0',
      status: 'active'
    });

    // Web scraping environment
    this.environments.set('webscraping', {
      id: 'webscraping',
      name: 'Web Scraping Environment',
      pythonVersion: '3.9',
      packages: [
        { name: 'requests', version: '2.26.0', installed: true },
        { name: 'beautifulsoup4', version: '1.0', installed: true },
        { name: 'scrapy', version: '2.5.0', installed: true },
        { name: 'selenium', version: '4.0.0', installed: true }
      ],
      requirements: 'requests>=2.26.0\nbeautifulsoup4>=4.10.0\nscrapy>=2.5.0\nselenium>=4.0.0',
      status: 'active'
    });
  }

  /**
   * Register default Python tools
   */
  private registerDefaultPythonTools(): void {
    // Data Analysis Tool
    this.registerPythonTool({
      name: 'analyze_data',
      description: 'Analyze dataset and generate statistical summary',
      category: 'data',
      timeout: 30000,
      memoryLimit: 1024,
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'CSV data or file path' },
          analysis_type: { type: 'string', enum: ['summary', 'correlation', 'distribution'] }
        },
        required: ['data']
      },
      pythonCode: `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

def analyze_data(data, analysis_type='summary'):
    try:
        # Load data
        if data.endswith('.csv'):
            df = pd.read_csv(data)
        else:
            df = pd.read_csv(io.StringIO(data))
        
        results = {}
        
        if analysis_type == 'summary':
            results['shape'] = df.shape
            results['dtypes'] = df.dtypes.to_dict()
            results['describe'] = df.describe().to_dict()
            results['missing_values'] = df.isnull().sum().to_dict()
            
        elif analysis_type == 'correlation':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 1:
                corr_matrix = df[numeric_cols].corr()
                results['correlation_matrix'] = corr_matrix.to_dict()
                
                # Generate heatmap
                plt.figure(figsize=(10, 8))
                sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0)
                plt.title('Correlation Matrix')
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
                buffer.seek(0)
                plot_data = base64.b64encode(buffer.getvalue()).decode()
                plt.close()
                
                results['heatmap'] = plot_data
                
        elif analysis_type == 'distribution':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            distributions = {}
            
            for col in numeric_cols[:5]:  # Limit to first 5 columns
                plt.figure(figsize=(8, 6))
                df[col].hist(bins=30, alpha=0.7)
                plt.title(f'Distribution of {col}')
                plt.xlabel(col)
                plt.ylabel('Frequency')
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
                buffer.seek(0)
                plot_data = base64.b64encode(buffer.getvalue()).decode()
                plt.close()
                
                distributions[col] = {
                    'plot': plot_data,
                    'mean': float(df[col].mean()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max())
                }
            
            results['distributions'] = distributions
        
        return results
        
    except Exception as e:
        raise Exception(f"Data analysis failed: {str(e)}")
`,
      requirements: ['pandas', 'numpy', 'matplotlib', 'seaborn']
    });

    // Machine Learning Model Training Tool
    this.registerPythonTool({
      name: 'train_ml_model',
      description: 'Train machine learning model on dataset',
      category: 'ml',
      timeout: 300000, // 5 minutes
      memoryLimit: 2048,
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'Training data CSV' },
          target_column: { type: 'string', description: 'Target column name' },
          model_type: { type: 'string', enum: ['classification', 'regression'] },
          algorithm: { type: 'string', enum: ['random_forest', 'xgboost', 'linear'] }
        },
        required: ['data', 'target_column', 'model_type']
      },
      pythonCode: `
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
import xgboost as xgb
import joblib
import io

def train_ml_model(data, target_column, model_type, algorithm='random_forest'):
    try:
        # Load data
        if data.endswith('.csv'):
            df = pd.read_csv(data)
        else:
            df = pd.read_csv(io.StringIO(data))
        
        # Prepare features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Handle categorical variables (simple encoding)
        X = pd.get_dummies(X, drop_first=True)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Select and train model
        if model_type == 'classification':
            if algorithm == 'random_forest':
                model = RandomForestClassifier(n_estimators=100, random_state=42)
            elif algorithm == 'xgboost':
                model = xgb.XGBClassifier(random_state=42)
            else:
                model = LogisticRegression(random_state=42)
        else:  # regression
            if algorithm == 'random_forest':
                model = RandomForestRegressor(n_estimators=100, random_state=42)
            elif algorithm == 'xgboost':
                model = xgb.XGBRegressor(random_state=42)
            else:
                model = LinearRegression()
        
        # Train model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        if model_type == 'classification':
            accuracy = accuracy_score(y_test, y_pred)
            metrics = {
                'accuracy': float(accuracy),
                'classification_report': classification_report(y_test, y_pred, output_dict=True)
            }
        else:
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            metrics = {
                'mse': float(mse),
                'rmse': float(rmse),
                'r2_score': float(model.score(X_test, y_test))
            }
        
        # Save model
        model_path = f'/tmp/model_{algorithm}_{model_type}.joblib'
        joblib.dump(model, model_path)
        
        # Feature importance (if available)
        feature_importance = None
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(X.columns, model.feature_importances_))
        
        return {
            'model_path': model_path,
            'metrics': metrics,
            'feature_importance': feature_importance,
            'model_type': model_type,
            'algorithm': algorithm,
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
    except Exception as e:
        raise Exception(f"Model training failed: {str(e)}")
`,
      requirements: ['pandas', 'numpy', 'scikit-learn', 'xgboost', 'joblib']
    });

    // Web Scraping Tool
    this.registerPythonTool({
      name: 'scrape_website',
      description: 'Scrape content from website using BeautifulSoup',
      category: 'web',
      timeout: 60000,
      memoryLimit: 512,
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to scrape' },
          selector: { type: 'string', description: 'CSS selector for content' },
          max_pages: { type: 'number', description: 'Maximum pages to scrape' }
        },
        required: ['url']
      },
      pythonCode: `
import requests
from bs4 import BeautifulSoup
import time
import re
from urllib.parse import urljoin, urlparse

def scrape_website(url, selector=None, max_pages=1):
    try:
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        scraped_data = []
        visited_urls = set()
        
        def scrape_page(page_url):
            if page_url in visited_urls or len(visited_urls) >= max_pages:
                return
                
            visited_urls.add(page_url)
            
            try:
                response = session.get(page_url, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                page_data = {
                    'url': page_url,
                    'title': soup.title.string if soup.title else '',
                    'status_code': response.status_code
                }
                
                if selector:
                    # Extract specific content using selector
                    elements = soup.select(selector)
                    page_data['selected_content'] = [el.get_text(strip=True) for el in elements]
                else:
                    # Extract common content types
                    page_data['headings'] = {
                        'h1': [h.get_text(strip=True) for h in soup.find_all('h1')],
                        'h2': [h.get_text(strip=True) for h in soup.find_all('h2')],
                        'h3': [h.get_text(strip=True) for h in soup.find_all('h3')]
                    }
                    
                    page_data['paragraphs'] = [p.get_text(strip=True) for p in soup.find_all('p')][:10]
                    page_data['links'] = [urljoin(page_url, a.get('href', '')) for a in soup.find_all('a', href=True)][:20]
                    
                    # Extract meta information
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    page_data['meta_description'] = meta_desc.get('content', '') if meta_desc else ''
                
                scraped_data.append(page_data)
                
                # Small delay between requests
                time.sleep(1)
                
            except Exception as e:
                scraped_data.append({
                    'url': page_url,
                    'error': str(e),
                    'status_code': getattr(e, 'response', {}).get('status_code', 0)
                })
        
        # Start scraping
        scrape_page(url)
        
        # If max_pages > 1, try to find and scrape additional pages
        if max_pages > 1 and scraped_data:
            first_page_links = scraped_data[0].get('links', [])
            same_domain_links = [link for link in first_page_links 
                               if urlparse(link).netloc == urlparse(url).netloc]
            
            for link in same_domain_links[:max_pages-1]:
                scrape_page(link)
        
        return {
            'scraped_pages': len(scraped_data),
            'data': scraped_data,
            'summary': {
                'total_paragraphs': sum(len(page.get('paragraphs', [])) for page in scraped_data),
                'total_links': sum(len(page.get('links', [])) for page in scraped_data),
                'successful_scrapes': len([p for p in scraped_data if 'error' not in p])
            }
        }
        
    except Exception as e:
        raise Exception(f"Web scraping failed: {str(e)}")
`,
      requirements: ['requests', 'beautifulsoup4']
    });

    // Data Visualization Tool
    this.registerPythonTool({
      name: 'create_visualization',
      description: 'Create data visualizations using matplotlib and seaborn',
      category: 'visualization',
      timeout: 60000,
      memoryLimit: 1024,
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'CSV data or file path' },
          chart_type: { type: 'string', enum: ['bar', 'line', 'scatter', 'histogram', 'heatmap', 'box'] },
          x_column: { type: 'string', description: 'X-axis column' },
          y_column: { type: 'string', description: 'Y-axis column' },
          title: { type: 'string', description: 'Chart title' }
        },
        required: ['data', 'chart_type']
      },
      pythonCode: `
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import numpy as np

def create_visualization(data, chart_type, x_column=None, y_column=None, title=None):
    try:
        # Load data
        if data.endswith('.csv'):
            df = pd.read_csv(data)
        else:
            df = pd.read_csv(io.StringIO(data))
        
        # Set style
        plt.style.use('seaborn-v0_8')
        fig, ax = plt.subplots(figsize=(10, 6))
        
        if title:
            ax.set_title(title, fontsize=14, fontweight='bold')
        
        if chart_type == 'bar':
            if x_column and y_column:
                df.groupby(x_column)[y_column].mean().plot(kind='bar', ax=ax)
            else:
                df.select_dtypes(include=[np.number]).iloc[:, 0].value_counts().plot(kind='bar', ax=ax)
                
        elif chart_type == 'line':
            if x_column and y_column:
                ax.plot(df[x_column], df[y_column])
                ax.set_xlabel(x_column)
                ax.set_ylabel(y_column)
            else:
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for col in numeric_cols[:3]:
                    ax.plot(df.index, df[col], label=col)
                ax.legend()
                
        elif chart_type == 'scatter':
            if x_column and y_column:
                ax.scatter(df[x_column], df[y_column], alpha=0.6)
                ax.set_xlabel(x_column)
                ax.set_ylabel(y_column)
            else:
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) >= 2:
                    ax.scatter(df[numeric_cols[0]], df[numeric_cols[1]], alpha=0.6)
                    ax.set_xlabel(numeric_cols[0])
                    ax.set_ylabel(numeric_cols[1])
                    
        elif chart_type == 'histogram':
            if x_column:
                df[x_column].hist(ax=ax, bins=30, alpha=0.7)
                ax.set_xlabel(x_column)
            else:
                numeric_col = df.select_dtypes(include=[np.number]).columns[0]
                df[numeric_col].hist(ax=ax, bins=30, alpha=0.7)
                ax.set_xlabel(numeric_col)
            ax.set_ylabel('Frequency')
            
        elif chart_type == 'heatmap':
            numeric_df = df.select_dtypes(include=[np.number])
            correlation = numeric_df.corr()
            sns.heatmap(correlation, annot=True, cmap='coolwarm', center=0, ax=ax)
            
        elif chart_type == 'box':
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            df[numeric_cols].boxplot(ax=ax)
            ax.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Convert plot to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        plot_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'chart_type': chart_type,
            'plot_data': plot_data,
            'data_shape': df.shape,
            'columns_used': [x_column, y_column] if x_column and y_column else list(df.columns)
        }
        
    except Exception as e:
        raise Exception(f"Visualization creation failed: {str(e)}")
`,
      requirements: ['pandas', 'matplotlib', 'seaborn', 'numpy']
    });
  }

  /**
   * Setup ML model registry
   */
  private setupMLModels(): void {
    // Example trained models would be registered here
    console.log('🤖 ML model registry initialized');
  }

  /**
   * Register new Python tool
   */
  registerPythonTool(tool: PythonTool): void {
    this.pythonTools.set(tool.name, tool);
    console.log(`🔧 Registered Python tool: ${tool.name}`);
  }

  /**
   * Execute Python tool
   */
  async executePythonTool(toolName: string, input: any): Promise<ExecutionResult> {
    const tool = this.pythonTools.get(toolName);
    if (!tool) {
      throw new Error(`Python tool not found: ${toolName}`);
    }

    const startTime = Date.now();

    try {
      // Simulate Python execution
      const result = await this.simulatePythonExecution(tool, input);
      
      const executionResult: ExecutionResult = {
        success: true,
        output: result.output || 'Execution completed successfully',
        executionTime: Date.now() - startTime,
        memoryUsed: Math.random() * 512 + 128, // Simulated memory usage
        returnValue: result.returnValue
      };

      // Add plots if visualization tool
      if (tool.category === 'visualization' && result.returnValue?.plot_data) {
        executionResult.plots = [{
          format: 'png',
          data: result.returnValue.plot_data,
          title: input.title || 'Generated Visualization'
        }];
      }

      // Store execution history
      this.executionHistory.push({
        toolName,
        input,
        result: executionResult,
        timestamp: new Date()
      });

      return executionResult;

    } catch (error: any) {
      const executionResult: ExecutionResult = {
        success: false,
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime,
        memoryUsed: 0
      };

      this.executionHistory.push({
        toolName,
        input,
        result: executionResult,
        timestamp: new Date()
      });

      return executionResult;
    }
  }

  /**
   * Simulate Python code execution
   */
  private async simulatePythonExecution(tool: PythonTool, input: any): Promise<{
    output: string;
    returnValue: any;
  }> {
    // Simulate execution based on tool type
    switch (tool.name) {
      case 'analyze_data':
        return {
          output: 'Data analysis completed',
          returnValue: {
            shape: [100, 5],
            dtypes: { col1: 'float64', col2: 'int64', col3: 'object' },
            describe: { col1: { mean: 50.5, std: 15.2 }, col2: { mean: 25.8, std: 8.1 } },
            missing_values: { col1: 0, col2: 2, col3: 1 }
          }
        };
      
      case 'train_ml_model':
        return {
          output: 'Model training completed',
          returnValue: {
            model_path: '/tmp/model_random_forest_classification.joblib',
            metrics: { accuracy: 0.85, classification_report: {} },
            feature_importance: { feature1: 0.3, feature2: 0.25, feature3: 0.45 },
            model_type: input.model_type,
            algorithm: input.algorithm || 'random_forest',
            training_samples: 800,
            test_samples: 200
          }
        };
      
      case 'scrape_website':
        return {
          output: 'Web scraping completed',
          returnValue: {
            scraped_pages: 1,
            data: [{
              url: input.url,
              title: 'Sample Website Title',
              status_code: 200,
              headings: { h1: ['Main Heading'], h2: ['Subheading 1', 'Subheading 2'] },
              paragraphs: ['Sample paragraph content', 'Another paragraph'],
              links: ['https://example.com/link1', 'https://example.com/link2']
            }],
            summary: { total_paragraphs: 2, total_links: 2, successful_scrapes: 1 }
          }
        };
      
      case 'create_visualization':
        return {
          output: 'Visualization created',
          returnValue: {
            chart_type: input.chart_type,
            plot_data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            data_shape: [100, 3],
            columns_used: [input.x_column, input.y_column].filter(Boolean)
          }
        };
      
      default:
        return {
          output: `${tool.name} executed successfully`,
          returnValue: { status: 'completed' }
        };
    }
  }

  /**
   * Start FastAPI server
   */
  async startServer(): Promise<void> {
    console.log('🚀 Starting FastAPI MCP server...');
    
    // Simulate server startup
    this.server = {
      host: this.config.host,
      port: this.config.port,
      running: true,
      docs_url: `http://${this.config.host}:${this.config.port}/docs`,
      health_url: `http://${this.config.host}:${this.config.port}/health`
    };

    console.log(`✅ FastAPI MCP server running on http://${this.config.host}:${this.config.port}`);
    console.log(`📚 API docs available at ${this.server.docs_url}`);
    console.log(`🛠️ Python tools available: ${this.pythonTools.size}`);
  }

  /**
   * Create new Python environment
   */
  async createEnvironment(config: {
    name: string;
    pythonVersion: string;
    requirements: string[];
  }): Promise<PythonEnvironment> {
    const envId = `env_${Date.now()}`;
    
    const environment: PythonEnvironment = {
      id: envId,
      name: config.name,
      pythonVersion: config.pythonVersion,
      packages: config.requirements.map(pkg => ({
        name: pkg.split('>=')[0],
        version: pkg.includes('>=') ? pkg.split('>=')[1] : 'latest',
        installed: false
      })),
      requirements: config.requirements.join('\n'),
      status: 'installing'
    };

    this.environments.set(envId, environment);
    
    // Simulate installation
    setTimeout(() => {
      environment.status = 'active';
      environment.packages.forEach(pkg => pkg.installed = true);
    }, 2000);

    return environment;
  }

  /**
   * Install packages in environment
   */
  async installPackages(envId: string, packages: string[]): Promise<void> {
    const env = this.environments.get(envId);
    if (!env) {
      throw new Error(`Environment not found: ${envId}`);
    }

    env.status = 'installing';
    
    // Add new packages
    for (const pkg of packages) {
      const [name, version] = pkg.split('>=');
      if (!env.packages.find(p => p.name === name)) {
        env.packages.push({
          name,
          version: version || 'latest',
          installed: false
        });
      }
    }

    // Simulate installation
    setTimeout(() => {
      env.status = 'active';
      env.packages.forEach(pkg => pkg.installed = true);
      env.requirements = env.packages.map(p => `${p.name}>=${p.version}`).join('\n');
    }, 1000);
  }

  /**
   * Register ML model
   */
  registerMLModel(model: Omit<MLModel, 'id'>): MLModel {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const mlModel: MLModel = {
      id: modelId,
      ...model
    };

    this.mlModels.set(modelId, mlModel);
    console.log(`🤖 Registered ML model: ${mlModel.name}`);
    return mlModel;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 50): Array<{
    toolName: string;
    input: any;
    result: ExecutionResult;
    timestamp: Date;
  }> {
    return this.executionHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get available Python tools
   */
  getPythonTools(): PythonTool[] {
    return Array.from(this.pythonTools.values());
  }

  /**
   * Get Python environments
   */
  getEnvironments(): PythonEnvironment[] {
    return Array.from(this.environments.values());
  }

  /**
   * Get ML models
   */
  getMLModels(): MLModel[] {
    return Array.from(this.mlModels.values());
  }

  /**
   * Stop server
   */
  async stopServer(): Promise<void> {
    if (this.server) {
      console.log('🛑 Stopping FastAPI MCP server...');
      this.server = null;
      console.log('✅ FastAPI MCP server stopped');
    }
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    running: boolean;
    pythonTools: number;
    environments: number;
    mlModels: number;
    executionHistory: number;
    capabilities: string[];
  } {
    return {
      running: this.server !== null,
      pythonTools: this.pythonTools.size,
      environments: this.environments.size,
      mlModels: this.mlModels.size,
      executionHistory: this.executionHistory.length,
      capabilities: [
        'python-execution',
        'data-analysis',
        'machine-learning',
        'web-scraping',
        'data-visualization',
        'scientific-computing',
        'environment-management',
        'model-training',
        'statistical-analysis',
        'plot-generation'
      ]
    };
  }
}

// Factory function
export function createFastAPIMCPService(config?: Partial<FastAPIMCPConfig>): FastAPIMCPService {
  return new FastAPIMCPService(config);
}

export default FastAPIMCPService;