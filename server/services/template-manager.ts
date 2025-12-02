/**
 * Template Manager - Enterprise Project Templates System
 * Provides comprehensive templates for various types of enterprise applications
 */

import { ProjectTemplate, InsertProjectTemplate } from '@shared/schema';

export interface TemplateSourceCode {
  structure: Record<string, any>;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  environment: Record<string, string>;
}

export class TemplateManager {
  private templates: Map<string, ProjectTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize comprehensive default templates
   */
  private initializeDefaultTemplates(): void {
    // Full-Stack Website Template
    this.addTemplate({
      name: "Full-Stack Enterprise Website",
      description: "Complete enterprise website with React frontend, Node.js backend, PostgreSQL database, authentication, CMS, analytics, and deployment pipeline.",
      category: "web",
      type: "full-stack-website",
      technologies: [
        "React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Drizzle ORM",
        "Tailwind CSS", "Shadcn/ui", "Next.js", "Prisma", "JWT Auth", "Stripe",
        "AWS S3", "Redis", "Docker", "GitHub Actions", "Vercel"
      ],
      features: [
        "User Authentication & Authorization",
        "Content Management System",
        "E-commerce Integration",
        "Blog & News System",
        "Contact Forms & Lead Management",
        "SEO Optimization",
        "Multi-language Support",
        "Analytics & Tracking",
        "Admin Dashboard",
        "Payment Processing",
        "Email Notifications",
        "File Upload & Management",
        "Real-time Chat Support",
        "Progressive Web App",
        "Mobile Responsive Design"
      ],
      sourceCode: this.getFullStackWebsiteCode(),
      configuration: {
        database: "postgresql",
        authentication: "jwt",
        styling: "tailwind",
        deployment: "vercel",
        cms: "strapi",
        payment: "stripe"
      },
      requirements: {
        node: ">=18",
        postgres: ">=14",
        memory: "2GB",
        storage: "10GB"
      },
      complexity: 4,
      estimatedTime: "4-6 weeks",
      thumbnail: "/templates/fullstack-website.png",
      screenshots: [
        "/templates/fullstack-website-1.png",
        "/templates/fullstack-website-2.png",
        "/templates/fullstack-website-3.png"
      ],
      tags: ["enterprise", "fullstack", "ecommerce", "cms", "authentication"],
      createdBy: 1
    });

    // Analytics Dashboard Template
    this.addTemplate({
      name: "Enterprise Analytics Dashboard",
      description: "Comprehensive analytics dashboard with real-time data visualization, custom reports, KPI tracking, and advanced filtering capabilities.",
      category: "analytics",
      type: "analytics-dashboard",
      technologies: [
        "React", "TypeScript", "D3.js", "Chart.js", "Recharts", "Node.js",
        "Python", "FastAPI", "Pandas", "NumPy", "PostgreSQL", "Redis",
        "Elasticsearch", "Kafka", "WebSocket", "Tailwind CSS"
      ],
      features: [
        "Real-time Data Visualization",
        "Custom Dashboard Builder",
        "Advanced Filtering & Search",
        "Export to PDF/Excel",
        "Automated Reports",
        "KPI Monitoring & Alerts",
        "Data Source Integration",
        "User Role Management",
        "Collaborative Features",
        "API Integration",
        "Data Warehousing",
        "Machine Learning Insights",
        "Mobile Responsive",
        "Dark/Light Theme"
      ],
      sourceCode: this.getAnalyticsDashboardCode(),
      configuration: {
        charting: "recharts",
        dataProcessing: "pandas",
        realtime: "websocket",
        database: "postgresql+elasticsearch",
        caching: "redis"
      },
      requirements: {
        node: ">=18",
        python: ">=3.9",
        postgres: ">=14",
        elasticsearch: ">=8",
        memory: "4GB",
        storage: "20GB"
      },
      complexity: 5,
      estimatedTime: "6-8 weeks",
      thumbnail: "/templates/analytics-dashboard.png",
      tags: ["analytics", "dashboard", "visualization", "realtime", "enterprise"],
      createdBy: 1
    });

    // 3D Voice Assistant Template
    this.addTemplate({
      name: "3D Multilingual Voice Assistant",
      description: "Advanced 3D voice assistant with real-time speech recognition, natural language processing, multilingual support, and 3D avatar interaction.",
      category: "ai",
      type: "voice-assistant",
      technologies: [
        "React", "Three.js", "WebGL", "Web Speech API", "WebRTC", "Node.js",
        "Python", "OpenAI API", "Google Cloud Speech", "Azure Cognitive Services",
        "WebSocket", "FFmpeg", "TensorFlow.js", "Babylon.js"
      ],
      features: [
        "3D Avatar with Lip Sync",
        "Real-time Speech Recognition",
        "Natural Language Processing",
        "Multilingual Support (50+ languages)",
        "Text-to-Speech Synthesis",
        "Conversation Memory",
        "Custom Voice Training",
        "Emotion Recognition",
        "Gesture Control",
        "Integration APIs",
        "Voice Commands",
        "Background Noise Filtering",
        "Offline Mode",
        "Custom Personalities"
      ],
      sourceCode: this.get3DVoiceAssistantCode(),
      configuration: {
        engine3d: "threejs",
        speechAPI: "web-speech-api",
        nlp: "openai",
        tts: "azure",
        avatar: "readyplayerme"
      },
      requirements: {
        node: ">=18",
        python: ">=3.9",
        gpu: "recommended",
        memory: "6GB",
        storage: "15GB"
      },
      complexity: 5,
      estimatedTime: "8-10 weeks",
      thumbnail: "/templates/voice-assistant.png",
      tags: ["ai", "voice", "3d", "multilingual", "assistant", "nlp"],
      createdBy: 1
    });

    // Simple Chat Application Template
    this.addTemplate({
      name: "Simple Chat with Voice & Text",
      description: "Real-time chat application with voice messages, text support, file sharing, emoji reactions, and group conversations.",
      category: "communication",
      type: "chat-app",
      technologies: [
        "React", "Socket.io", "Node.js", "Express", "MongoDB", "WebRTC",
        "Multer", "Sharp", "JWT", "Bcrypt", "Tailwind CSS", "Framer Motion"
      ],
      features: [
        "Real-time Messaging",
        "Voice Messages",
        "File & Image Sharing",
        "Emoji Reactions",
        "Group Conversations",
        "User Presence Status",
        "Message Encryption",
        "Push Notifications",
        "Message Search",
        "Dark/Light Mode",
        "Mobile Responsive",
        "Typing Indicators",
        "Message Deletion",
        "User Blocking"
      ],
      sourceCode: this.getSimpleChatCode(),
      configuration: {
        realtime: "socketio",
        database: "mongodb",
        fileStorage: "local",
        encryption: "bcrypt"
      },
      requirements: {
        node: ">=16",
        mongodb: ">=5",
        memory: "1GB",
        storage: "5GB"
      },
      complexity: 3,
      estimatedTime: "2-3 weeks",
      thumbnail: "/templates/chat-app.png",
      tags: ["chat", "realtime", "voice", "communication", "simple"],
      createdBy: 1
    });

    // PWA Nutrition & Fitness Template
    this.addTemplate({
      name: "PWA Nutrition & Fitness Tracker",
      description: "Progressive Web App for nutrition tracking, fitness planning, workout routines, calorie counting, and health analytics.",
      category: "mobile",
      type: "pwa-nutrition",
      technologies: [
        "React", "PWA", "TypeScript", "Workbox", "IndexedDB", "Chart.js",
        "Camera API", "Geolocation API", "Push API", "Node.js", "Express",
        "PostgreSQL", "Stripe", "Nutrition API", "Tailwind CSS"
      ],
      features: [
        "Offline Functionality",
        "Barcode Scanning",
        "Nutrition Database",
        "Calorie Tracking",
        "Workout Plans",
        "Progress Analytics",
        "Meal Planning",
        "Recipe Suggestions",
        "Water Intake Tracking",
        "Exercise Timer",
        "Social Features",
        "Goal Setting",
        "Export Data",
        "Push Notifications",
        "Wearable Integration"
      ],
      sourceCode: this.getPWANutritionCode(),
      configuration: {
        pwa: "workbox",
        database: "indexeddb+postgresql",
        api: "nutrition-api",
        payments: "stripe"
      },
      requirements: {
        node: ">=18",
        browser: "modern",
        memory: "512MB",
        storage: "2GB"
      },
      complexity: 4,
      estimatedTime: "5-7 weeks",
      thumbnail: "/templates/pwa-nutrition.png",
      tags: ["pwa", "nutrition", "fitness", "health", "mobile", "offline"],
      createdBy: 1
    });

    // Health & Fitness Studio Platform
    this.addTemplate({
      name: "Health & Fitness Studio Platform",
      description: "Complete fitness studio management platform with member management, class scheduling, payment processing, and mobile app.",
      category: "enterprise",
      type: "fitness-studio",
      technologies: [
        "React", "React Native", "Node.js", "Express", "PostgreSQL", "Redis",
        "Stripe", "Socket.io", "JWT", "AWS S3", "Push Notifications",
        "Calendar API", "Payment Gateway", "QR Codes", "Analytics"
      ],
      features: [
        "Member Management",
        "Class Scheduling",
        "Trainer Management",
        "Payment Processing",
        "Membership Plans",
        "Check-in System",
        "Mobile App",
        "Workout Tracking",
        "Nutrition Plans",
        "Progress Analytics",
        "Equipment Management",
        "Notification System",
        "Reporting Dashboard",
        "Multi-location Support",
        "Integration APIs"
      ],
      sourceCode: this.getFitnessStudioCode(),
      configuration: {
        frontend: "react",
        mobile: "react-native",
        backend: "nodejs",
        database: "postgresql",
        payments: "stripe",
        storage: "aws-s3"
      },
      requirements: {
        node: ">=18",
        postgres: ">=14",
        redis: ">=6",
        memory: "4GB",
        storage: "25GB"
      },
      complexity: 5,
      estimatedTime: "10-12 weeks",
      thumbnail: "/templates/fitness-studio.png",
      tags: ["fitness", "studio", "management", "enterprise", "mobile", "payments"],
      createdBy: 1
    });
  }

  /**
   * Add a new template
   */
  addTemplate(templateData: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'rating' | 'isActive'>): void {
    const template: ProjectTemplate = {
      id: this.templates.size + 1,
      ...templateData,
      isActive: true,
      downloadCount: 0,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.templates.set(template.type, template);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Get template by type
   */
  getTemplateByType(type: string): ProjectTemplate | undefined {
    return this.templates.get(type);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: number): ProjectTemplate | undefined {
    return Array.from(this.templates.values()).find(t => t.id === id);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): ProjectTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllTemplates().filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      template.technologies.some(tech => tech.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Template Source Code Generators
  private getFullStackWebsiteCode(): TemplateSourceCode {
    return {
      structure: {
        "client/": {
          "src/": {
            "components/": ["Header.tsx", "Footer.tsx", "Hero.tsx", "Features.tsx"],
            "pages/": ["Home.tsx", "About.tsx", "Contact.tsx", "Products.tsx"],
            "hooks/": ["useAuth.ts", "useApi.ts"],
            "utils/": ["api.ts", "constants.ts"],
            "styles/": ["globals.css", "components.css"]
          },
          "public/": ["index.html", "manifest.json", "robots.txt"]
        },
        "server/": {
          "src/": {
            "routes/": ["auth.ts", "products.ts", "cms.ts"],
            "middleware/": ["auth.ts", "cors.ts", "validation.ts"],
            "models/": ["User.ts", "Product.ts", "Page.ts"],
            "services/": ["email.ts", "payment.ts", "upload.ts"]
          }
        },
        "shared/": {
          "types/": ["index.ts", "api.ts"],
          "constants/": ["index.ts"]
        }
      },
      files: {
        "package.json": JSON.stringify({
          name: "enterprise-website",
          scripts: {
            "dev": "concurrently \"npm run server\" \"npm run client\"",
            "build": "npm run build:client && npm run build:server",
            "start": "node dist/server/index.js"
          }
        }, null, 2),
        "client/src/App.tsx": `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;`,
        "server/src/index.ts": `import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
      },
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.0",
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "jsonwebtoken": "^9.0.0",
        "bcrypt": "^5.1.0",
        "drizzle-orm": "^0.29.0",
        "postgres": "^3.4.0"
      },
      scripts: {
        "dev": "concurrently \"npm run server\" \"npm run client\"",
        "build": "npm run build:client && npm run build:server",
        "start": "node dist/server/index.js"
      },
      environment: {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/website_db",
        "JWT_SECRET": "your-super-secret-jwt-key",
        "STRIPE_SECRET_KEY": "sk_test_...",
        "EMAIL_SERVICE": "sendgrid",
        "EMAIL_API_KEY": "your-sendgrid-api-key"
      }
    };
  }

  private getAnalyticsDashboardCode(): TemplateSourceCode {
    return {
      structure: {
        "frontend/": {
          "src/": {
            "components/": {
              "charts/": ["LineChart.tsx", "BarChart.tsx", "PieChart.tsx"],
              "dashboard/": ["DashboardGrid.tsx", "Widget.tsx", "Filters.tsx"],
              "ui/": ["Button.tsx", "Input.tsx", "Select.tsx"]
            },
            "pages/": ["Dashboard.tsx", "Reports.tsx", "Settings.tsx"],
            "hooks/": ["useData.ts", "useWebSocket.ts", "useCharts.ts"]
          }
        },
        "backend/": {
          "src/": {
            "api/": ["data.ts", "reports.ts", "websocket.ts"],
            "services/": ["analytics.ts", "aggregation.ts", "export.ts"],
            "models/": ["Metric.ts", "Report.ts", "Dashboard.ts"]
          }
        },
        "data-pipeline/": {
          "processors/": ["realtime.py", "batch.py", "ml.py"],
          "connectors/": ["database.py", "api.py", "streaming.py"]
        }
      },
      files: {
        "frontend/src/components/charts/LineChart.tsx": `import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const CustomLineChart: React.FC<LineChartProps> = ({ data, xKey, yKey, color = '#8884d8' }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke={color} />
      </LineChart>
    </ResponsiveContainer>
  );
};`
      },
      dependencies: {
        "react": "^18.2.0",
        "recharts": "^2.8.0",
        "d3": "^7.8.0",
        "socket.io-client": "^4.7.0",
        "express": "^4.18.2",
        "socket.io": "^4.7.0",
        "pandas": "^2.0.0",
        "numpy": "^1.24.0",
        "fastapi": "^0.100.0"
      },
      scripts: {
        "dev": "concurrently \"npm run frontend\" \"npm run backend\" \"python run-pipeline.py\"",
        "build": "npm run build:frontend && npm run build:backend",
        "start": "npm run start:backend"
      },
      environment: {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/analytics_db",
        "ELASTICSEARCH_URL": "http://localhost:9200",
        "REDIS_URL": "redis://localhost:6379",
        "KAFKA_BROKERS": "localhost:9092"
      }
    };
  }

  private get3DVoiceAssistantCode(): TemplateSourceCode {
    return {
      structure: {
        "frontend/": {
          "src/": {
            "components/": {
              "avatar/": ["Avatar3D.tsx", "FacialAnimation.tsx", "LipSync.tsx"],
              "voice/": ["SpeechRecognition.tsx", "TextToSpeech.tsx", "VoiceControls.tsx"],
              "ui/": ["ChatInterface.tsx", "Settings.tsx", "LanguageSelector.tsx"]
            },
            "services/": ["speechAPI.ts", "nlpService.ts", "avatarService.ts"],
            "utils/": ["audioUtils.ts", "3dUtils.ts", "languageUtils.ts"]
          }
        },
        "backend/": {
          "src/": {
            "services/": ["speechProcessing.ts", "nlpEngine.ts", "ttsEngine.ts"],
            "models/": ["Conversation.ts", "User.ts", "VoiceProfile.ts"],
            "ai/": ["intentRecognition.py", "responseGeneration.py", "emotionDetection.py"]
          }
        },
        "assets/": {
          "3d/": ["avatar.glb", "animations/", "textures/"],
          "audio/": ["voices/", "sounds/", "effects/"]
        }
      },
      files: {
        "frontend/src/components/avatar/Avatar3D.tsx": `import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface Avatar3DProps {
  modelPath: string;
  animation?: string;
  speechText?: string;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ modelPath, animation, speechText }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(400, 400);
    mountRef.current?.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      scene.add(gltf.scene);
      
      // Animation setup
      const mixer = new THREE.AnimationMixer(gltf.scene);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);
        mixer.update(0.016);
        renderer.render(scene, camera);
      };
      animate();
    });

    camera.position.z = 2;

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [modelPath]);

  return <div ref={mountRef} className="avatar-container" />;
};`
      },
      dependencies: {
        "three": "^0.158.0",
        "@types/three": "^0.158.0",
        "react": "^18.2.0",
        "socket.io-client": "^4.7.0",
        "openai": "^4.0.0",
        "azure-cognitiveservices-speech-sdk": "^1.33.0"
      },
      scripts: {
        "dev": "concurrently \"npm run frontend\" \"npm run backend\" \"python run-ai.py\"",
        "build": "npm run build:frontend && npm run build:backend",
        "start": "npm run start:backend"
      },
      environment: {
        "OPENAI_API_KEY": "sk-...",
        "AZURE_SPEECH_KEY": "your-azure-speech-key",
        "AZURE_SPEECH_REGION": "eastus",
        "GOOGLE_CLOUD_SPEECH_KEY": "your-google-cloud-key"
      }
    };
  }

  private getSimpleChatCode(): TemplateSourceCode {
    return {
      structure: {
        "client/": {
          "src/": {
            "components/": ["ChatWindow.tsx", "MessageList.tsx", "MessageInput.tsx", "VoiceRecorder.tsx"],
            "hooks/": ["useSocket.ts", "useVoice.ts", "useChat.ts"],
            "utils/": ["socketClient.ts", "audioUtils.ts"]
          }
        },
        "server/": {
          "src/": {
            "socket/": ["chatHandler.ts", "voiceHandler.ts"],
            "models/": ["Message.ts", "User.ts", "Room.ts"],
            "utils/": ["fileUpload.ts", "encryption.ts"]
          }
        }
      },
      files: {
        "client/src/components/ChatWindow.tsx": `import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useSocket } from '../hooks/useSocket';

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState([]);
  const { socket, sendMessage } = useSocket();

  useEffect(() => {
    socket?.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};`
      },
      dependencies: {
        "react": "^18.2.0",
        "socket.io": "^4.7.0",
        "socket.io-client": "^4.7.0",
        "express": "^4.18.2",
        "multer": "^1.4.5",
        "bcrypt": "^5.1.0"
      },
      scripts: {
        "dev": "concurrently \"npm run client\" \"npm run server\"",
        "build": "npm run build:client && npm run build:server",
        "start": "node dist/server/index.js"
      },
      environment: {
        "DATABASE_URL": "mongodb://localhost:27017/chat_app",
        "JWT_SECRET": "your-jwt-secret",
        "FILE_UPLOAD_PATH": "./uploads"
      }
    };
  }

  private getPWANutritionCode(): TemplateSourceCode {
    return {
      structure: {
        "src/": {
          "components/": {
            "nutrition/": ["FoodSearch.tsx", "CalorieTracker.tsx", "NutritionFacts.tsx"],
            "fitness/": ["WorkoutPlanner.tsx", "ExerciseTimer.tsx", "ProgressChart.tsx"],
            "pwa/": ["InstallPrompt.tsx", "OfflineIndicator.tsx", "SyncStatus.tsx"]
          },
          "services/": ["nutritionAPI.ts", "offlineStorage.ts", "syncService.ts"],
          "sw/": ["serviceWorker.ts", "backgroundSync.ts"]
        },
        "public/": ["manifest.json", "sw.js", "icons/"]
      },
      files: {
        "public/manifest.json": JSON.stringify({
          "name": "Nutrition & Fitness Tracker",
          "short_name": "NutriTracker",
          "display": "standalone",
          "background_color": "#ffffff",
          "theme_color": "#000000",
          "icons": [
            {
              "src": "icon-192.png",
              "sizes": "192x192",
              "type": "image/png"
            }
          ]
        }, null, 2)
      },
      dependencies: {
        "react": "^18.2.0",
        "workbox-webpack-plugin": "^7.0.0",
        "idb": "^8.0.0",
        "chart.js": "^4.4.0",
        "react-chartjs-2": "^5.2.0"
      },
      scripts: {
        "dev": "react-scripts start",
        "build": "react-scripts build && workbox generateSW",
        "start": "serve -s build"
      },
      environment: {
        "REACT_APP_NUTRITION_API_KEY": "your-nutrition-api-key",
        "REACT_APP_API_URL": "https://api.nutritionix.com/v1_1"
      }
    };
  }

  private getFitnessStudioCode(): TemplateSourceCode {
    return {
      structure: {
        "web/": {
          "src/": {
            "pages/": ["Dashboard.tsx", "Members.tsx", "Classes.tsx", "Trainers.tsx"],
            "components/": ["MemberCard.tsx", "ClassSchedule.tsx", "PaymentForm.tsx"],
            "services/": ["api.ts", "stripe.ts", "notifications.ts"]
          }
        },
        "mobile/": {
          "src/": {
            "screens/": ["Home.tsx", "Profile.tsx", "Classes.tsx", "Workouts.tsx"],
            "components/": ["QRScanner.tsx", "CheckIn.tsx", "WorkoutTimer.tsx"],
            "services/": ["api.ts", "storage.ts", "notifications.ts"]
          }
        },
        "backend/": {
          "src/": {
            "routes/": ["members.ts", "classes.ts", "payments.ts", "reports.ts"],
            "services/": ["membershipService.ts", "classService.ts", "paymentService.ts"],
            "models/": ["Member.ts", "Class.ts", "Trainer.ts", "Payment.ts"]
          }
        }
      },
      files: {
        "mobile/App.tsx": `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Classes from './src/screens/Classes';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Classes" component={Classes} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`
      },
      dependencies: {
        "react": "^18.2.0",
        "react-native": "^0.72.0",
        "@react-navigation/native": "^6.1.0",
        "express": "^4.18.2",
        "stripe": "^13.0.0",
        "qrcode": "^1.5.0"
      },
      scripts: {
        "dev": "concurrently \"npm run web\" \"npm run backend\"",
        "android": "react-native run-android",
        "ios": "react-native run-ios",
        "build": "npm run build:web && npm run build:backend"
      },
      environment: {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/fitness_db",
        "STRIPE_SECRET_KEY": "sk_test_...",
        "STRIPE_PUBLISHABLE_KEY": "pk_test_...",
        "PUSH_NOTIFICATION_KEY": "your-fcm-key"
      }
    };
  }
}

export const templateManager = new TemplateManager();