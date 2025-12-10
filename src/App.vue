<template>
  <v-app>
    <!-- Home View -->
    <v-main v-if="currentView === 'home'">
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Logo Section -->
            <v-card class="mb-8 pa-6 text-center" elevation="4">
              <div class="logo-container">
                <v-icon size="120" color="primary">mdi-trophy-variant</v-icon>
                <h1 class="text-h3 mt-4 font-weight-bold">Umareal Tournament</h1>
                <p class="text-subtitle-1 text-medium-emphasis">Triple Threat Racing Championship</p>
              </div>
            </v-card>

            <!-- Tournaments List -->
            <v-card class="mb-6" elevation="4">
              <v-card-title class="text-h5 d-flex align-center">
                <v-icon class="mr-2" color="accent">mdi-tournament</v-icon>
                Open Tournaments
              </v-card-title>
              <v-divider></v-divider>
              
              <v-card-text>
                <v-list v-if="tournaments.length > 0" bg-color="transparent">
                  <v-list-item
                    v-for="tournament in tournaments"
                    :key="tournament.id"
                    class="mb-2"
                    rounded
                    :prepend-icon="tournament.icon"
                    :title="tournament.name"
                    :subtitle="`${tournament.participants.length} participants`"
                    @click="openTournament(tournament)"
                  >
                  </v-list-item>
                </v-list>
                
                <v-alert
                  v-else
                  type="info"
                  variant="tonal"
                  border="start"
                  class="my-4"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  No tournaments yet. Create your first tournament to get started!
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- New Tournament Button -->
            <v-row justify="center">
              <v-col cols="auto">
                <v-btn
                  size="x-large"
                  color="primary"
                  prepend-icon="mdi-plus-circle"
                  @click="createNewTournament"
                  elevation="8"
                >
                  New Tournament
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <!-- Tournament View -->
    <TournamentView
      v-else-if="currentView === 'tournament' && selectedTournament"
      :tournament="selectedTournament"
      @back="handleBackToHome"
      @update="handleTournamentUpdate"
    />
    
    <!-- New Tournament Dialog -->
    <NewTournamentDialog
      v-model="showNewTournamentDialog"
      @created="handleTournamentCreated"
      ref="tournamentDialog"
    />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NewTournamentDialog from './components/NewTournamentDialog.vue';
import TournamentView from './components/TournamentView.vue';
import { tournamentService } from './services/tournamentService.js';
import { applyTournamentColors, resetToDefaultColors } from './themeConfig.js';

const tournaments = ref([]);
const showNewTournamentDialog = ref(false);
const tournamentDialog = ref(null);
const currentView = ref('home');
const selectedTournament = ref(null);

const loadTournaments = async () => {
  tournaments.value = await tournamentService.getAllTournaments();
};

const createNewTournament = () => {
  showNewTournamentDialog.value = true;
};

const handleTournamentCreated = async (tournamentName) => {
  try {
    const newTournament = await tournamentService.createTournament(tournamentName);
    tournaments.value.push(newTournament);
    showNewTournamentDialog.value = false;
  } catch (error) {
    // Pass error back to dialog
    if (tournamentDialog.value) {
      tournamentDialog.value.setError(error.message);
    }
  }
};

const openTournament = (tournament) => {
  selectedTournament.value = tournament;
  currentView.value = 'tournament';
  applyTournamentColors(tournament);
};

const handleBackToHome = () => {
  currentView.value = 'home';
  selectedTournament.value = null;
  resetToDefaultColors();
};

const handleTournamentUpdate = async (updatedTournament) => {
  try {
    console.log('Saving tournament:', updatedTournament);
    const result = await tournamentService.updateTournament(updatedTournament);
    console.log('Save result:', result);
    
    // Update in the list
    const index = tournaments.value.findIndex(t => t.id === updatedTournament.id);
    if (index !== -1) {
      tournaments.value[index] = updatedTournament;
    }
    
    // Update selected tournament and apply colors
    selectedTournament.value = updatedTournament;
    applyTournamentColors(updatedTournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
  }
};

onMounted(() => {
  loadTournaments();
});
</script>

<style scoped>
.logo-container {
  padding: 2rem 0;
}

.v-list-item {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease-in-out;
}

.v-list-item:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 105, 180, 0.5);
}
</style>
