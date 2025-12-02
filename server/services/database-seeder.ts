/**
 * Database Seeder for WAI DevStudio
 * Seeds the database with real SDLC workflow templates and initial data
 */

import { storage } from '../storage-enhanced';
import type { InsertSDLCWorkflowTemplate } from '@shared/schema';

export class DatabaseSeeder {
  async seedSDLCWorkflowTemplates(): Promise<void> {
    console.log('🌱 Seeding SDLC Workflow Templates...');

    const templates: InsertSDLCWorkflowTemplate[] = [
      {
        name: 'Full Stack Web Application Development',
        category: 'development',
        phase: 'implementation',
        description: 'Complete development lifecycle for modern web applications with React frontend and Node.js backend',
        complexity: 'complex',
        estimatedDuration: 2880, // 48 hours
        teamSize: '3-5 developers',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
        deliverables: ['Source Code', 'Documentation', 'Test Suite', 'Deployment Scripts'],
        prerequisites: ['Project Requirements', 'UI/UX Designs', 'Database Schema'],
        successCriteria: ['All tests passing', 'Security scan clean', 'Performance benchmarks met'],
        riskMitigation: ['Code reviews', 'Automated testing', 'Staged deployment'],
        steps: [
          { 
            id: 'setup', 
            name: 'Project Setup', 
            duration: 240, 
            agent: 'architect',
            description: 'Initialize project structure, configure build tools, and set up development environment',
            dependencies: [],
            outputs: ['Project structure', 'Build configuration', 'Environment setup']
          },
          { 
            id: 'backend', 
            name: 'Backend Development', 
            duration: 960, 
            agent: 'backend_developer',
            description: 'Develop API endpoints, database models, and business logic',
            dependencies: ['setup'],
            outputs: ['REST API', 'Database schema', 'Authentication system']
          },
          { 
            id: 'frontend', 
            name: 'Frontend Development', 
            duration: 960, 
            agent: 'frontend_developer',
            description: 'Build user interface components and integrate with backend APIs',
            dependencies: ['backend'],
            outputs: ['UI components', 'State management', 'API integration']
          },
          { 
            id: 'testing', 
            name: 'Integration Testing', 
            duration: 480, 
            agent: 'qa_engineer',
            description: 'Test end-to-end functionality and system integration',
            dependencies: ['frontend'],
            outputs: ['Test suite', 'Test reports', 'Bug tracking']
          },
          { 
            id: 'security', 
            name: 'Security Review', 
            duration: 240, 
            agent: 'security_specialist',
            description: 'Conduct security audit and vulnerability assessment',
            dependencies: ['testing'],
            outputs: ['Security report', 'Vulnerability fixes', 'Security guidelines']
          }
        ],
        version: '2.1'
      },
      {
        name: 'Mobile Application Development (React Native)',
        category: 'development',
        phase: 'implementation',
        description: 'Cross-platform mobile application development using React Native',
        complexity: 'complex',
        estimatedDuration: 3360, // 56 hours
        teamSize: '3-4 developers',
        technologies: ['React Native', 'Expo', 'Firebase', 'TypeScript', 'Redux'],
        deliverables: ['Mobile App', 'App Store Package', 'Documentation', 'Testing Suite'],
        prerequisites: ['Mobile App Designs', 'API Specifications', 'Platform Guidelines'],
        successCriteria: ['App Store approval', 'Performance targets met', 'User acceptance testing passed'],
        riskMitigation: ['Device testing', 'Platform compliance checks', 'Beta testing'],
        steps: [
          { 
            id: 'mobile_setup', 
            name: 'Mobile Project Setup', 
            duration: 320, 
            agent: 'mobile_developer',
            description: 'Configure React Native environment and project structure',
            dependencies: [],
            outputs: ['Project configuration', 'Development environment', 'Build scripts']
          },
          { 
            id: 'core_features', 
            name: 'Core Feature Development', 
            duration: 1440, 
            agent: 'mobile_developer',
            description: 'Implement main application features and navigation',
            dependencies: ['mobile_setup'],
            outputs: ['Core features', 'Navigation system', 'State management']
          },
          { 
            id: 'platform_integration', 
            name: 'Platform Integration', 
            duration: 960, 
            agent: 'mobile_developer',
            description: 'Integrate with device features and platform-specific APIs',
            dependencies: ['core_features'],
            outputs: ['Platform APIs', 'Device features', 'Push notifications']
          },
          { 
            id: 'mobile_testing', 
            name: 'Mobile Testing', 
            duration: 640, 
            agent: 'qa_engineer',
            description: 'Test on multiple devices and operating system versions',
            dependencies: ['platform_integration'],
            outputs: ['Test results', 'Device compatibility', 'Performance metrics']
          }
        ],
        version: '1.0'
      },
      {
        name: 'Requirements Analysis & Planning',
        category: 'planning',
        phase: 'requirements',
        description: 'Comprehensive requirements gathering and project planning phase',
        complexity: 'moderate',
        estimatedDuration: 960, // 16 hours
        teamSize: '2-3 analysts',
        technologies: ['Documentation Tools', 'Modeling Software', 'Survey Tools'],
        deliverables: ['Requirements Document', 'Project Plan', 'Risk Assessment', 'Stakeholder Analysis'],
        prerequisites: ['Project Charter', 'Stakeholder List', 'Business Objectives'],
        successCriteria: ['Requirements approved', 'Project plan accepted', 'Budget approved'],
        riskMitigation: ['Stakeholder interviews', 'Requirement validation', 'Iterative planning'],
        steps: [
          { 
            id: 'stakeholder_analysis', 
            name: 'Stakeholder Analysis', 
            duration: 240, 
            agent: 'business_analyst',
            description: 'Identify and analyze all project stakeholders',
            dependencies: [],
            outputs: ['Stakeholder matrix', 'Communication plan', 'Influence analysis']
          },
          { 
            id: 'requirement_gathering', 
            name: 'Requirement Gathering', 
            duration: 480, 
            agent: 'business_analyst',
            description: 'Collect functional and non-functional requirements',
            dependencies: ['stakeholder_analysis'],
            outputs: ['Requirements list', 'User stories', 'Acceptance criteria']
          },
          { 
            id: 'project_planning', 
            name: 'Project Planning', 
            duration: 240, 
            agent: 'project_manager',
            description: 'Create detailed project plan and timeline',
            dependencies: ['requirement_gathering'],
            outputs: ['Project timeline', 'Resource allocation', 'Milestone schedule']
          }
        ],
        version: '1.0'
      },
      {
        name: 'System Architecture Design',
        category: 'planning',
        phase: 'design',
        description: 'Design system architecture and technical specifications',
        complexity: 'complex',
        estimatedDuration: 1440, // 24 hours
        teamSize: '2-4 architects',
        technologies: ['Architecture Tools', 'Modeling Software', 'Documentation Platforms'],
        deliverables: ['System Architecture', 'Technical Specifications', 'Database Design', 'API Design'],
        prerequisites: ['Requirements Document', 'Technology Constraints', 'Performance Requirements'],
        successCriteria: ['Architecture review passed', 'Technical feasibility confirmed', 'Scalability validated'],
        riskMitigation: ['Architecture reviews', 'Proof of concepts', 'Technology validation'],
        steps: [
          { 
            id: 'high_level_design', 
            name: 'High-Level Architecture', 
            duration: 480, 
            agent: 'system_architect',
            description: 'Design overall system architecture and component interactions',
            dependencies: [],
            outputs: ['System diagram', 'Component architecture', 'Technology stack']
          },
          { 
            id: 'database_design', 
            name: 'Database Architecture', 
            duration: 360, 
            agent: 'data_architect',
            description: 'Design database schema and data flow',
            dependencies: ['high_level_design'],
            outputs: ['Database schema', 'Data model', 'Migration strategy']
          },
          { 
            id: 'api_design', 
            name: 'API Design', 
            duration: 360, 
            agent: 'system_architect',
            description: 'Design API endpoints and integration patterns',
            dependencies: ['database_design'],
            outputs: ['API specification', 'Integration patterns', 'Security protocols']
          },
          { 
            id: 'security_architecture', 
            name: 'Security Architecture', 
            duration: 240, 
            agent: 'security_architect',
            description: 'Design security measures and protocols',
            dependencies: ['api_design'],
            outputs: ['Security framework', 'Authentication design', 'Authorization model']
          }
        ],
        version: '1.0'
      },
      {
        name: 'CI/CD Pipeline Implementation',
        category: 'deployment',
        phase: 'deployment',
        description: 'Set up continuous integration and deployment pipeline',
        complexity: 'moderate',
        estimatedDuration: 960, // 16 hours
        teamSize: '1-2 DevOps engineers',
        technologies: ['GitHub Actions', 'Docker', 'Kubernetes', 'AWS/Azure/GCP'],
        deliverables: ['CI/CD Pipeline', 'Deployment Scripts', 'Monitoring Setup', 'Documentation'],
        prerequisites: ['Source Code Repository', 'Cloud Infrastructure', 'Testing Suite'],
        successCriteria: ['Automated deployment working', 'Monitoring active', 'Rollback capability'],
        riskMitigation: ['Staged deployment', 'Automated testing', 'Monitoring alerts'],
        steps: [
          { 
            id: 'pipeline_setup', 
            name: 'Pipeline Configuration', 
            duration: 360, 
            agent: 'devops_engineer',
            description: 'Configure CI/CD pipeline and automation workflows',
            dependencies: [],
            outputs: ['Pipeline configuration', 'Build automation', 'Test automation']
          },
          { 
            id: 'deployment_config', 
            name: 'Deployment Configuration', 
            duration: 360, 
            agent: 'devops_engineer',
            description: 'Set up deployment environments and infrastructure',
            dependencies: ['pipeline_setup'],
            outputs: ['Environment configuration', 'Infrastructure as code', 'Deployment scripts']
          },
          { 
            id: 'monitoring_setup', 
            name: 'Monitoring & Alerting', 
            duration: 240, 
            agent: 'devops_engineer',
            description: 'Implement monitoring, logging, and alerting systems',
            dependencies: ['deployment_config'],
            outputs: ['Monitoring dashboard', 'Log aggregation', 'Alert configuration']
          }
        ],
        version: '1.0'
      },
      {
        name: 'Comprehensive Testing Suite',
        category: 'testing',
        phase: 'testing',
        description: 'Implement comprehensive testing strategy including unit, integration, and E2E tests',
        complexity: 'complex',
        estimatedDuration: 1920, // 32 hours
        teamSize: '2-4 QA engineers',
        technologies: ['Jest', 'Cypress', 'Selenium', 'Postman', 'Performance Testing Tools'],
        deliverables: ['Test Suite', 'Test Reports', 'Performance Benchmarks', 'Quality Metrics'],
        prerequisites: ['Application Code', 'Test Requirements', 'Testing Environment'],
        successCriteria: ['90%+ code coverage', 'All critical paths tested', 'Performance targets met'],
        riskMitigation: ['Test automation', 'Continuous testing', 'Risk-based testing'],
        steps: [
          { 
            id: 'unit_testing', 
            name: 'Unit Testing', 
            duration: 480, 
            agent: 'qa_engineer',
            description: 'Implement comprehensive unit tests for all components',
            dependencies: [],
            outputs: ['Unit test suite', 'Code coverage report', 'Test documentation']
          },
          { 
            id: 'integration_testing', 
            name: 'Integration Testing', 
            duration: 480, 
            agent: 'qa_engineer',
            description: 'Test component integration and API endpoints',
            dependencies: ['unit_testing'],
            outputs: ['Integration tests', 'API test suite', 'Database test data']
          },
          { 
            id: 'e2e_testing', 
            name: 'End-to-End Testing', 
            duration: 480, 
            agent: 'qa_engineer',
            description: 'Implement user journey and workflow testing',
            dependencies: ['integration_testing'],
            outputs: ['E2E test suite', 'User journey tests', 'Cross-browser tests']
          },
          { 
            id: 'performance_testing', 
            name: 'Performance Testing', 
            duration: 360, 
            agent: 'performance_engineer',
            description: 'Conduct load testing and performance optimization',
            dependencies: ['e2e_testing'],
            outputs: ['Performance benchmarks', 'Load test results', 'Optimization recommendations']
          },
          { 
            id: 'security_testing', 
            name: 'Security Testing', 
            duration: 240, 
            agent: 'security_specialist',
            description: 'Perform security testing and vulnerability assessment',
            dependencies: ['performance_testing'],
            outputs: ['Security test report', 'Vulnerability assessment', 'Penetration test results']
          }
        ],
        version: '1.0'
      }
    ];

    try {
      for (const template of templates) {
        // Check if template already exists
        const existingTemplates = await storage.getSDLCWorkflowTemplatesByCategory(template.category);
        const exists = existingTemplates.some(t => t.name === template.name);
        
        if (!exists) {
          await storage.createSDLCWorkflowTemplate(template);
          console.log(`✅ Created template: ${template.name}`);
        } else {
          console.log(`⏭️  Template already exists: ${template.name}`);
        }
      }
      
      console.log('🌱 SDLC Workflow Templates seeding completed!');
    } catch (error) {
      console.error('❌ Error seeding SDLC templates:', error);
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      await this.seedSDLCWorkflowTemplates();
      // Add more seed methods here as needed
      
      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export const databaseSeeder = new DatabaseSeeder();