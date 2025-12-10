<template>
  <v-app>
    <!-- Top Bar -->
    <v-app-bar color="surface" elevation="2" density="compact" height="50">
      <v-btn
        icon="mdi-arrow-left"
        size="small"
        variant="text"
        @click="goBack"
      ></v-btn>
      
      <v-toolbar-title class="text-body-1 font-weight-medium">
        {{ tournament?.name || 'Tournament' }}
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn
        icon="mdi-cog"
        size="small"
        variant="text"
        @click="openSettings"
      ></v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-tabs v-model="currentTab" color="primary" class="px-4 pt-2">
        <v-tab value="brackets">Brackets</v-tab>
        <v-tab value="qualifiers">Qualifiers</v-tab>
      </v-tabs>

      <v-window v-model="currentTab">
        <!-- Brackets Tab -->
        <v-window-item value="brackets">
          <v-container fluid class="pa-8">
            <v-card class="text-center pa-12" variant="outlined">
              <v-icon size="64" color="primary" class="mb-4">mdi-tournament</v-icon>
              <h2 class="text-h4 text-medium-emphasis">Tournament Brackets</h2>
              <p class="text-body-1 mt-2 text-medium-emphasis">
                Bracket view will be implemented here
              </p>
            </v-card>
          </v-container>
        </v-window-item>

        <!-- Qualifiers Tab -->
        <v-window-item value="qualifiers">
          <QualifiersView 
            :tournament="tournament"
            @update="handleQualifiersUpdate"
          />
        </v-window-item>
      </v-window>
    </v-main>

    <!-- Settings Dialog -->
    <TournamentSettingsDialog
      v-model="showSettings"
      :tournament="tournament"
      @save="handleSettingsSave"
    />
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import TournamentSettingsDialog from './TournamentSettingsDialog.vue';
import QualifiersView from './QualifiersView.vue';

const props = defineProps({
  tournament: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'update']);

const showSettings = ref(false);
const currentTab = ref('qualifiers');

const goBack = () => {
  emit('back');
};

const openSettings = () => {
  showSettings.value = true;
};

const handleSettingsSave = (updatedTournament) => {
  emit('update', updatedTournament);
};

const handleQualifiersUpdate = (updatedTournament) => {
  emit('update', updatedTournament);
};
</script>

<style scoped>
.v-toolbar-title {
  font-weight: 600;
}
</style>
