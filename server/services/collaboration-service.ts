/**
 * Real-time Collaboration Service
 * Handles multi-user project collaboration, live cursors, and file synchronization
 * Phase 1 Implementation - Core Collaboration Features
 */

import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

export interface CollaborativeUser {
  id: string;
  userId: number;
  username: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  lastActivity: Date;
  currentFile?: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
}

export interface ProjectCollaboration {
  projectId: string;
  users: Map<string, CollaborativeUser>;
  activeFiles: Map<string, Set<string>>; // file -> user IDs
  fileVersions: Map<string, number>;
  operationQueue: Operation[];
}

export interface Operation {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'cursor_move';
  file: string;
  position: { line: number, column: number };
  content?: string;
  length?: number;
}

export interface CollaborationEvent {
  type: 'user_join' | 'user_leave' | 'cursor_update' | 'file_change' | 'presence_update';
  projectId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

class CollaborationService extends EventEmitter {
  private projectSessions = new Map<string, ProjectCollaboration>();
  private userConnections = new Map<string, WebSocket>();
  private userColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  /**
   * User joins a project collaboration session
   */
  async joinProject(
    connectionId: string, 
    projectId: string, 
    userId: number, 
    username: string, 
    ws: WebSocket
  ): Promise<CollaborativeUser> {
    // Get or create project session
    if (!this.projectSessions.has(projectId)) {
      this.projectSessions.set(projectId, {
        projectId,
        users: new Map(),
        activeFiles: new Map(),
        fileVersions: new Map(),
        operationQueue: []
      });
    }

    const session = this.projectSessions.get(projectId)!;
    
    // Create collaborative user
    const collaborativeUser: CollaborativeUser = {
      id: connectionId,
      userId,
      username,
      color: this.getUserColor(userId),
      isActive: true,
      lastActivity: new Date()
    };

    // Add user to session
    session.users.set(connectionId, collaborativeUser);
    this.userConnections.set(connectionId, ws);

    // Notify other users
    this.broadcastToProject(projectId, {
      type: 'user_join',
      projectId,
      userId: connectionId,
      data: collaborativeUser,
      timestamp: new Date()
    }, connectionId);

    // Send current state to new user
    this.sendCurrentState(connectionId, projectId);

    console.log(`✅ User ${username} joined project ${projectId}`);
    return collaborativeUser;
  }

  /**
   * User leaves a project collaboration session
   */
  async leaveProject(connectionId: string, projectId: string): Promise<void> {
    const session = this.projectSessions.get(projectId);
    if (!session) return;

    const user = session.users.get(connectionId);
    if (!user) return;

    // Remove user from active files
    session.activeFiles.forEach((userIds, file) => {
      userIds.delete(connectionId);
      if (userIds.size === 0) {
        session.activeFiles.delete(file);
      }
    });

    // Remove user from session
    session.users.delete(connectionId);
    this.userConnections.delete(connectionId);

    // Notify other users
    this.broadcastToProject(projectId, {
      type: 'user_leave',
      projectId,
      userId: connectionId,
      data: { user },
      timestamp: new Date()
    });

    // Clean up empty session
    if (session.users.size === 0) {
      this.projectSessions.delete(projectId);
    }

    console.log(`👋 User ${user.username} left project ${projectId}`);
  }

  /**
   * Handle cursor position updates
   */
  updateCursorPosition(
    connectionId: string,
    projectId: string,
    file: string,
    position: { line: number, column: number }
  ): void {
    const session = this.projectSessions.get(projectId);
    if (!session) return;

    const user = session.users.get(connectionId);
    if (!user) return;

    // Update user state
    user.currentFile = file;
    user.cursorPosition = position;
    user.lastActivity = new Date();

    // Update active files
    if (!session.activeFiles.has(file)) {
      session.activeFiles.set(file, new Set());
    }
    session.activeFiles.get(file)!.add(connectionId);

    // Broadcast cursor update
    this.broadcastToProject(projectId, {
      type: 'cursor_update',
      projectId,
      userId: connectionId,
      data: { file, position, user: { id: connectionId, username: user.username, color: user.color } },
      timestamp: new Date()
    }, connectionId);
  }

  /**
   * Handle file content changes with Operational Transformation
   */
  handleFileChange(
    connectionId: string,
    projectId: string,
    file: string,
    operation: Omit<Operation, 'id' | 'userId' | 'timestamp'>
  ): void {
    const session = this.projectSessions.get(projectId);
    if (!session) return;

    const user = session.users.get(connectionId);
    if (!user) return;

    // Create operation
    const op: Operation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: connectionId,
      timestamp: new Date(),
      ...operation,
      file
    };

    // Add to operation queue
    session.operationQueue.push(op);

    // Update file version
    const currentVersion = session.fileVersions.get(file) || 0;
    session.fileVersions.set(file, currentVersion + 1);

    // Broadcast file change
    this.broadcastToProject(projectId, {
      type: 'file_change',
      projectId,
      userId: connectionId,
      data: { 
        operation: op, 
        fileVersion: currentVersion + 1,
        user: { id: connectionId, username: user.username, color: user.color }
      },
      timestamp: new Date()
    }, connectionId);

    // Update user activity
    user.lastActivity = new Date();
  }

  /**
   * Get active users for a project
   */
  getProjectUsers(projectId: string): CollaborativeUser[] {
    const session = this.projectSessions.get(projectId);
    if (!session) return [];

    return Array.from(session.users.values())
      .filter(user => user.isActive);
  }

  /**
   * Get active files for a project
   */
  getActiveFiles(projectId: string): { file: string, users: CollaborativeUser[] }[] {
    const session = this.projectSessions.get(projectId);
    if (!session) return [];

    const result: { file: string, users: CollaborativeUser[] }[] = [];
    
    session.activeFiles.forEach((userIds, file) => {
      const users = Array.from(userIds)
        .map(id => session.users.get(id))
        .filter((user): user is CollaborativeUser => user !== undefined);
      
      if (users.length > 0) {
        result.push({ file, users });
      }
    });

    return result;
  }

  /**
   * Get project collaboration statistics
   */
  getProjectStats(projectId: string) {
    const session = this.projectSessions.get(projectId);
    if (!session) return null;

    return {
      totalUsers: session.users.size,
      activeUsers: Array.from(session.users.values()).filter(u => u.isActive).length,
      activeFiles: session.activeFiles.size,
      totalOperations: session.operationQueue.length,
      lastActivity: Math.max(...Array.from(session.users.values()).map(u => u.lastActivity.getTime()))
    };
  }

  /**
   * Private helper methods
   */
  private getUserColor(userId: number): string {
    return this.userColors[userId % this.userColors.length];
  }

  private sendCurrentState(connectionId: string, projectId: string): void {
    const session = this.projectSessions.get(projectId);
    const ws = this.userConnections.get(connectionId);
    
    if (!session || !ws || ws.readyState !== WebSocket.OPEN) return;

    const currentState = {
      type: 'project_state',
      data: {
        users: Array.from(session.users.values()).filter(u => u.id !== connectionId),
        activeFiles: this.getActiveFiles(projectId),
        fileVersions: Object.fromEntries(session.fileVersions)
      }
    };

    ws.send(JSON.stringify(currentState));
  }

  private broadcastToProject(
    projectId: string, 
    event: CollaborationEvent, 
    excludeConnectionId?: string
  ): void {
    const session = this.projectSessions.get(projectId);
    if (!session) return;

    session.users.forEach((user, connectionId) => {
      if (connectionId === excludeConnectionId) return;
      
      const ws = this.userConnections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(event));
        } catch (error) {
          console.error(`Error broadcasting to ${connectionId}:`, error);
          // Remove problematic connection
          this.userConnections.delete(connectionId);
          session.users.delete(connectionId);
        }
      }
    });
  }

  private setupCleanupInterval(): void {
    // Clean up inactive users every 30 seconds
    setInterval(() => {
      const now = new Date();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      this.projectSessions.forEach((session, projectId) => {
        const inactiveUsers: string[] = [];
        
        session.users.forEach((user, connectionId) => {
          if (now.getTime() - user.lastActivity.getTime() > inactiveThreshold) {
            inactiveUsers.push(connectionId);
          }
        });

        // Remove inactive users
        inactiveUsers.forEach(connectionId => {
          this.leaveProject(connectionId, projectId);
        });
      });
    }, 30000);
  }
}

export const collaborationService = new CollaborationService();