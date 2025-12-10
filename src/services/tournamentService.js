// Service for tournament operations
export const tournamentService = {
  async getAllTournaments() {
    if (!window.electron?.tournaments) {
      console.warn('Electron API not available');
      return [];
    }
    
    const result = await window.electron.tournaments.getAll();
    if (result.success) {
      return result.tournaments;
    } else {
      console.error('Error loading tournaments:', result.error);
      return [];
    }
  },

  async createTournament(name) {
    if (!window.electron?.tournaments) {
      throw new Error('Electron API not available');
    }
    
    const result = await window.electron.tournaments.create(name);
    if (result.success) {
      return result.tournament;
    } else {
      throw new Error(result.error);
    }
  },

  async updateTournament(tournament) {
    if (!window.electron?.tournaments) {
      throw new Error('Electron API not available');
    }
    
    try {
      console.log('TournamentService sending update:', JSON.stringify(tournament, null, 2));
      const result = await window.electron.tournaments.update(tournament);
      if (result.success) {
        return result.tournament;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error in updateTournament:', error);
      throw error;
    }
  },

  async getTournamentsPath() {
    if (!window.electron?.tournaments) {
      return null;
    }
    
    return await window.electron.tournaments.getPath();
  }
};
