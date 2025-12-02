
interface GameConfig {
  name: string;
  description: string;
  genre: string;
  platform: string;
  features: string[];
  gameplayType: 'therapeutic' | 'educational' | 'entertainment';
}

interface Game {
  id: string;
  name: string;
  description: string;
  genre: string;
  platform: string;
  features: string[];
  gameplayType: string;
  status: 'draft' | 'development' | 'testing' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

class AIGameBuilderService {
  private games: Map<string, Game> = new Map();

  constructor() {
    this.initializeDefaultGames();
  }

  private initializeDefaultGames(): void {
    const defaultGames: Game[] = [
      {
        id: 'game_1',
        name: 'Mindful Memory',
        description: 'A therapeutic memory game for cognitive enhancement',
        genre: 'puzzle',
        platform: 'web',
        features: ['Unity Integration', 'Progress Tracking', 'Adaptive Difficulty'],
        gameplayType: 'therapeutic',
        status: 'published',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'game_2',
        name: 'Math Adventure',
        description: 'Educational math game for children',
        genre: 'educational',
        platform: 'mobile',
        features: ['Gamification', 'Achievement System', 'Parent Dashboard'],
        gameplayType: 'educational',
        status: 'development',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    defaultGames.forEach(game => {
      this.games.set(game.id, game);
    });
  }

  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async createGame(config: GameConfig): Promise<Game> {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const game: Game = {
      id: gameId,
      name: config.name,
      description: config.description,
      genre: config.genre,
      platform: config.platform,
      features: config.features,
      gameplayType: config.gameplayType,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.set(gameId, game);
    return game;
  }

  async getGame(gameId: string): Promise<Game | null> {
    return this.games.get(gameId) || null;
  }

  async updateGame(gameId: string, updates: Partial<Game>): Promise<Game | null> {
    const game = this.games.get(gameId);
    if (!game) return null;

    const updatedGame = { ...game, ...updates, updatedAt: new Date() };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async deleteGame(gameId: string): Promise<boolean> {
    return this.games.delete(gameId);
  }
}

export const gameBuilderService = new AIGameBuilderService();
