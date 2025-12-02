/**
 * Source Code Editor Service
 * AI-powered code editing with real-time collaboration and GitHub synchronization
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import GitHubIntegration from './github-integration';

export interface EditorFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
  isModified: boolean;
  gitStatus?: 'untracked' | 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unmerged';
  sha?: string;
}

export interface EditorSession {
  id: string;
  projectId: string;
  userId: string;
  files: Map<string, EditorFile>;
  activeFile?: string;
  gitRepository?: {
    owner: string;
    repo: string;
    branch: string;
  };
  autoSave: boolean;
  collaborators: Array<{
    userId: string;
    userName: string;
    cursor?: {
      line: number;
      column: number;
      file: string;
    };
    selection?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
      file: string;
    };
  }>;
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'fix' | 'optimization' | 'security' | 'style';
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  originalCode: string;
  suggestedCode: string;
  confidence: number;
  agent: string;
  reasoning: string;
}

export interface CodeChange {
  id: string;
  sessionId: string;
  file: string;
  type: 'insert' | 'delete' | 'replace';
  position: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  content: string;
  timestamp: Date;
  userId: string;
  applied: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  language?: string;
  gitStatus?: string;
  lastModified?: Date;
}

export class SourceCodeEditor extends EventEmitter {
  private sessions: Map<string, EditorSession> = new Map();
  private githubIntegration?: GitHubIntegration;
  private projectPath: string;
  private suggestions: Map<string, CodeSuggestion[]> = new Map();
  private changes: Map<string, CodeChange[]> = new Map();

  constructor(projectPath: string, githubConfig?: any) {
    super();
    this.projectPath = projectPath;
    
    if (githubConfig) {
      this.githubIntegration = new GitHubIntegration(githubConfig);
    }
  }

  // Session Management
  async createSession(projectId: string, userId: string, options?: {
    autoSave?: boolean;
    gitRepository?: {
      owner: string;
      repo: string;
      branch: string;
    };
  }): Promise<EditorSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: EditorSession = {
      id: sessionId,
      projectId,
      userId,
      files: new Map(),
      autoSave: options?.autoSave ?? true,
      gitRepository: options?.gitRepository,
      collaborators: [{
        userId,
        userName: `User_${userId}`,
      }],
    };

    this.sessions.set(sessionId, session);
    this.suggestions.set(sessionId, []);
    this.changes.set(sessionId, []);

    // Load project files
    await this.loadProjectFiles(sessionId);

    this.emit('sessionCreated', { sessionId, session });
    return session;
  }

  async getSession(sessionId: string): Promise<EditorSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Auto-save if enabled
    if (session.autoSave) {
      await this.saveAllFiles(sessionId);
    }

    this.sessions.delete(sessionId);
    this.suggestions.delete(sessionId);
    this.changes.delete(sessionId);

    this.emit('sessionClosed', { sessionId });
  }

  // File Management
  async loadProjectFiles(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const files = await this.scanDirectory(this.projectPath);
    
    for (const file of files) {
      if (this.isTextFile(file)) {
        const content = await fs.readFile(file, 'utf-8');
        const relativePath = path.relative(this.projectPath, file);
        const stats = await fs.stat(file);
        
        const editorFile: EditorFile = {
          id: this.generateFileId(relativePath),
          path: relativePath,
          name: path.basename(file),
          content,
          language: this.detectLanguage(file),
          size: stats.size,
          lastModified: stats.mtime,
          isModified: false,
        };

        session.files.set(relativePath, editorFile);
      }
    }

    this.emit('filesLoaded', { sessionId, fileCount: session.files.size });
  }

  async getFile(sessionId: string, filePath: string): Promise<EditorFile | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    return session.files.get(filePath);
  }

  async updateFile(sessionId: string, filePath: string, content: string, userId: string): Promise<EditorFile> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const file = session.files.get(filePath);
    if (!file) throw new Error('File not found');

    const oldContent = file.content;
    file.content = content;
    file.isModified = true;
    file.lastModified = new Date();

    // Record the change
    const change: CodeChange = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      file: filePath,
      type: 'replace',
      position: {
        start: { line: 0, column: 0 },
        end: { line: oldContent.split('\n').length - 1, column: oldContent.split('\n').slice(-1)[0].length },
      },
      content,
      timestamp: new Date(),
      userId,
      applied: true,
    };

    const sessionChanges = this.changes.get(sessionId) || [];
    sessionChanges.push(change);
    this.changes.set(sessionId, sessionChanges);

    // Auto-save if enabled
    if (session.autoSave) {
      await this.saveFile(sessionId, filePath);
    }

    // Get AI suggestions for the updated content
    await this.generateSuggestions(sessionId, filePath, content);

    this.emit('fileUpdated', { sessionId, filePath, file, userId });
    return file;
  }

  async createFile(sessionId: string, filePath: string, content: string = '', userId: string): Promise<EditorFile> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.files.has(filePath)) {
      throw new Error('File already exists');
    }

    const fullPath = path.join(this.projectPath, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Create file
    await fs.writeFile(fullPath, content, 'utf-8');

    const stats = await fs.stat(fullPath);
    const editorFile: EditorFile = {
      id: this.generateFileId(filePath),
      path: filePath,
      name: path.basename(filePath),
      content,
      language: this.detectLanguage(fullPath),
      size: stats.size,
      lastModified: stats.mtime,
      isModified: false,
      gitStatus: 'untracked',
    };

    session.files.set(filePath, editorFile);

    this.emit('fileCreated', { sessionId, filePath, file: editorFile, userId });
    return editorFile;
  }

  async deleteFile(sessionId: string, filePath: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const file = session.files.get(filePath);
    if (!file) throw new Error('File not found');

    const fullPath = path.join(this.projectPath, filePath);
    await fs.unlink(fullPath);

    session.files.delete(filePath);

    this.emit('fileDeleted', { sessionId, filePath, userId });
  }

  async saveFile(sessionId: string, filePath: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const file = session.files.get(filePath);
    if (!file) throw new Error('File not found');

    const fullPath = path.join(this.projectPath, filePath);
    await fs.writeFile(fullPath, file.content, 'utf-8');

    file.isModified = false;
    const stats = await fs.stat(fullPath);
    file.size = stats.size;
    file.lastModified = stats.mtime;

    this.emit('fileSaved', { sessionId, filePath, file });
  }

  async saveAllFiles(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const modifiedFiles = Array.from(session.files.values()).filter(file => file.isModified);
    
    for (const file of modifiedFiles) {
      await this.saveFile(sessionId, file.path);
    }

    this.emit('allFilesSaved', { sessionId, savedCount: modifiedFiles.length });
  }

  // AI Code Suggestions
  async generateSuggestions(sessionId: string, filePath: string, content: string): Promise<CodeSuggestion[]> {
    // This would integrate with the WAI orchestration system
    // For now, we'll simulate some basic suggestions
    const suggestions: CodeSuggestion[] = [];

    // Simulate AI analysis
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for common issues
      if (line.includes('console.log')) {
        suggestions.push({
          id: `suggestion_${Date.now()}_${i}`,
          type: 'style',
          title: 'Remove console.log',
          description: 'Console.log statements should be removed in production code',
          file: filePath,
          line: i + 1,
          column: line.indexOf('console.log'),
          originalCode: line,
          suggestedCode: line.replace(/console\.log\([^)]*\);?\s*/g, ''),
          confidence: 0.8,
          agent: 'Code Quality Agent',
          reasoning: 'Console.log statements can impact performance and expose sensitive information',
        });
      }

      // Check for missing error handling
      if (line.includes('await ') && !content.includes('try') && !content.includes('catch')) {
        suggestions.push({
          id: `suggestion_${Date.now()}_${i}_error`,
          type: 'fix',
          title: 'Add error handling',
          description: 'Async operations should be wrapped in try-catch blocks',
          file: filePath,
          line: i + 1,
          column: 0,
          originalCode: line,
          suggestedCode: `try {\n  ${line}\n} catch (error) {\n  console.error('Error:', error);\n}`,
          confidence: 0.9,
          agent: 'Error Handling Agent',
          reasoning: 'Unhandled async operations can cause application crashes',
        });
      }
    }

    // Store suggestions for the session
    const sessionSuggestions = this.suggestions.get(sessionId) || [];
    const fileSuggestions = sessionSuggestions.filter(s => s.file !== filePath);
    fileSuggestions.push(...suggestions);
    this.suggestions.set(sessionId, fileSuggestions);

    this.emit('suggestionsGenerated', { sessionId, filePath, suggestions });
    return suggestions;
  }

  async getSuggestions(sessionId: string, filePath?: string): Promise<CodeSuggestion[]> {
    const suggestions = this.suggestions.get(sessionId) || [];
    
    if (filePath) {
      return suggestions.filter(s => s.file === filePath);
    }
    
    return suggestions;
  }

  async applySuggestion(sessionId: string, suggestionId: string, userId: string): Promise<void> {
    const suggestions = this.suggestions.get(sessionId) || [];
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) throw new Error('Suggestion not found');

    const file = await this.getFile(sessionId, suggestion.file);
    if (!file) throw new Error('File not found');

    const lines = file.content.split('\n');
    lines[suggestion.line - 1] = suggestion.suggestedCode;
    const newContent = lines.join('\n');

    await this.updateFile(sessionId, suggestion.file, newContent, userId);

    // Remove applied suggestion
    const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
    this.suggestions.set(sessionId, updatedSuggestions);

    this.emit('suggestionApplied', { sessionId, suggestionId, userId });
  }

  // GitHub Integration
  async syncWithGitHub(sessionId: string): Promise<void> {
    if (!this.githubIntegration) {
      throw new Error('GitHub integration not configured');
    }

    const session = this.sessions.get(sessionId);
    if (!session || !session.gitRepository) {
      throw new Error('Session or Git repository not found');
    }

    // Save all modified files first
    await this.saveAllFiles(sessionId);

    // Sync with GitHub
    const syncStatus = await this.githubIntegration.syncProject(
      this.projectPath,
      session.gitRepository.owner,
      session.gitRepository.repo,
      session.gitRepository.branch
    );

    this.emit('githubSynced', { sessionId, syncStatus });
  }

  async createGitHubRepository(sessionId: string, options: {
    name: string;
    description?: string;
    private?: boolean;
  }): Promise<void> {
    if (!this.githubIntegration) {
      throw new Error('GitHub integration not configured');
    }

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const repository = await this.githubIntegration.createRepository(options);
    
    session.gitRepository = {
      owner: repository.fullName.split('/')[0],
      repo: repository.name,
      branch: repository.defaultBranch,
    };

    this.emit('githubRepositoryCreated', { sessionId, repository });
  }

  // File Tree
  async getFileTree(sessionId: string): Promise<FileTreeNode> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    return this.buildFileTree(this.projectPath, session);
  }

  // Collaboration
  async addCollaborator(sessionId: string, userId: string, userName: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const existingCollaborator = session.collaborators.find(c => c.userId === userId);
    if (existingCollaborator) return;

    session.collaborators.push({
      userId,
      userName,
    });

    this.emit('collaboratorAdded', { sessionId, userId, userName });
  }

  async updateCursor(sessionId: string, userId: string, filePath: string, line: number, column: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const collaborator = session.collaborators.find(c => c.userId === userId);
    if (!collaborator) throw new Error('Collaborator not found');

    collaborator.cursor = { line, column, file: filePath };

    this.emit('cursorUpdated', { sessionId, userId, cursor: collaborator.cursor });
  }

  // Helper Methods
  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory() && !this.shouldIgnoreDirectory(item.name)) {
        const subFiles = await this.scanDirectory(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && !this.shouldIgnoreFile(item.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private shouldIgnoreDirectory(name: string): boolean {
    const ignoredDirs = ['.git', 'node_modules', '.next', 'dist', 'build', '.vscode', '.idea'];
    return ignoredDirs.includes(name) || name.startsWith('.');
  }

  private shouldIgnoreFile(name: string): boolean {
    const ignoredExtensions = ['.log', '.tmp', '.cache', '.lock'];
    const ignoredFiles = ['.DS_Store', 'Thumbs.db'];
    
    return ignoredFiles.includes(name) || 
           ignoredExtensions.some(ext => name.endsWith(ext)) ||
           name.startsWith('.');
  }

  private isTextFile(filePath: string): boolean {
    const textExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
      '.html', '.css', '.scss', '.sass', '.less',
      '.json', '.xml', '.yaml', '.yml', '.toml',
      '.md', '.txt', '.py', '.java', '.c', '.cpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift',
      '.kt', '.scala', '.clj', '.hs', '.ml', '.elm',
      '.sql', '.sh', '.bat', '.ps1', '.dockerfile',
      '.gitignore', '.gitattributes', '.env'
    ];

    const ext = path.extname(filePath).toLowerCase();
    return textExtensions.includes(ext) || !ext;
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'bash',
      '.dockerfile': 'dockerfile',
    };

    return languageMap[ext] || 'plaintext';
  }

  private generateFileId(filePath: string): string {
    return `file_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  }

  private async buildFileTree(dirPath: string, session: EditorSession): Promise<FileTreeNode> {
    const relativePath = path.relative(this.projectPath, dirPath);
    const name = path.basename(dirPath) || 'Project';
    
    const node: FileTreeNode = {
      name,
      path: relativePath,
      type: 'directory',
      children: [],
    };

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const itemRelativePath = path.relative(this.projectPath, fullPath);
        
        if (item.isDirectory() && !this.shouldIgnoreDirectory(item.name)) {
          const childNode = await this.buildFileTree(fullPath, session);
          node.children!.push(childNode);
        } else if (item.isFile() && !this.shouldIgnoreFile(item.name)) {
          const stats = await fs.stat(fullPath);
          const file = session.files.get(itemRelativePath);
          
          const fileNode: FileTreeNode = {
            name: item.name,
            path: itemRelativePath,
            type: 'file',
            size: stats.size,
            language: this.detectLanguage(fullPath),
            gitStatus: file?.gitStatus,
            lastModified: stats.mtime,
          };
          
          node.children!.push(fileNode);
        }
      }

      // Sort children: directories first, then files, both alphabetically
      node.children!.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      // Handle permission errors or other issues
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return node;
  }
}

export default SourceCodeEditor;