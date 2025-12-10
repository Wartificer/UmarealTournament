<template>
  <v-container fluid class="pa-4">
    <!-- Next Race Cycle Button -->
    <v-row class="mb-4">
      <v-col>
        <v-btn
          size="large"
          prepend-icon="mdi-sort"
          @click="handleNextRaceCycle"
          :disabled="hasRaceMismatch"
          block
        >
          Sort Participants by score
        </v-btn>
      </v-col>
    </v-row>

    <!-- Participants List -->
    <v-card
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      :class="{ 'drag-over': isDragging }"
      class="drop-zone"
    >
      <v-list v-if="participants.length > 0" class="pa-0">
        <template v-for="(participant, index) in participants" :key="participant.id">
          <ParticipantRow
            :participant="participant"
            :rank="index + 1"
            :ref="el => participantRefs[participant.id] = el"
            @update="handleParticipantUpdate"
            @disqualify="handleDisqualify"
            @remove="handleRemove"
          />
          <!-- Group separator every 3 participants -->
          <v-divider 
            v-if="(index + 1) % 3 === 0 && index < participants.length - 1" 
            :thickness="3" 
            class="my-2 group-divider"
          ></v-divider>
        </template>
      </v-list>
      
      <v-card-text v-else class="text-center pa-8">
        <v-icon size="64" color="grey">mdi-account-multiple-plus</v-icon>
        <p class="text-h6 mt-4 text-medium-emphasis">No participants yet</p>
        <p class="text-body-2 text-medium-emphasis">Add participants to start qualifiers</p>
        <v-btn color="primary" class="mt-4" @click="addTestParticipants">
          Add Test Participants
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Remove Confirmation Dialog -->
    <v-dialog v-model="showRemoveDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Remove Participant?
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove <strong>{{ participantToRemove?.name }}</strong> from the tournament?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showRemoveDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmRemove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import ParticipantRow from './ParticipantRow.vue';

const props = defineProps({
  tournament: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update']);

const showRemoveDialog = ref(false);
const participantToRemove = ref(null);
const participantRefs = ref({});
const snackbar = ref({
  show: false,
  message: '',
  color: 'info'
});
const isDragging = ref(false);

// Initialize participants from tournament data
const participants = ref(props.tournament.participants || []);

// Check if participants have mismatched race counts
const hasRaceMismatch = computed(() => {
  if (participants.value.length === 0) return true;
  
  const raceCounts = participants.value.map(p => {
    return p.races ? p.races.filter(r => r !== null).length : 0;
  });
  
  const firstCount = raceCounts[0];
  return !raceCounts.every(count => count === firstCount);
});

// Load participant images on mount
onMounted(async () => {
  console.log('Loading participants:', participants.value.length);
  for (const participant of participants.value) {
    if (participant.avatar && !participant.avatar.startsWith('data:')) {
      try {
        const result = await window.electron.tournaments.getImageData(
          props.tournament.name,
          participant.avatar
        );
        if (result.success) {
          participant.avatarPath = participant.avatar; // Store original path
          participant.avatar = result.dataUrl; // Use data URL for display
          console.log('Loaded image for', participant.name);
        }
      } catch (error) {
        console.error('Error loading image for', participant.name, error);
      }
    }
  }
});

const calculateTotalPoints = (participant) => {
  if (!participant.races) return 0;
  return participant.races.reduce((sum, race) => sum + (race || 0), 0);
};

const handleParticipantUpdate = (updatedParticipant) => {
  const index = participants.value.findIndex(p => p.id === updatedParticipant.id);
  if (index !== -1) {
    participants.value[index] = updatedParticipant;
    emitUpdate();
  }
};

const handleDisqualify = (participantId) => {
  const participant = participants.value.find(p => p.id === participantId);
  if (participant) {
    participant.disqualified = !participant.disqualified;
    emitUpdate();
    showToast(participant.disqualified ? 'Participant disqualified' : 'Disqualification removed', 'info');
  }
};

const handleRemove = (participantId) => {
  participantToRemove.value = participants.value.find(p => p.id === participantId);
  showRemoveDialog.value = true;
};

const confirmRemove = () => {
  if (participantToRemove.value) {
    participants.value = participants.value.filter(p => p.id !== participantToRemove.value.id);
    emitUpdate();
  }
  showRemoveDialog.value = false;
  participantToRemove.value = null;
};

const handleNextRaceCycle = async () => {
  // Count how many races each participant has set (excluding disqualified)
  const activeParticipants = participants.value.filter(p => !p.disqualified);
  
  if (activeParticipants.length === 0) {
    showToast('No active participants', 'warning');
    return;
  }
  
  // Count set races for each participant
  const raceCounts = activeParticipants.map(p => ({
    participant: p,
    setRaces: p.races.filter(r => r !== null).length
  }));
  


  // Sort participants by points (highest to lowest)
  participants.value.sort((a, b) => {
    if (a.disqualified && !b.disqualified) return 1;
    if (!a.disqualified && b.disqualified) return -1;
    if (a.disqualified && b.disqualified) return 0;
    
    return calculateTotalPoints(b) - calculateTotalPoints(a);
  });

  emitUpdate();
  showToast('Participants sorted by points!', 'success');
};

const showToast = (message, type = 'info') => {
  snackbar.value = {
    show: true,
    message: message,
    color: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'
  };
};

const emitUpdate = () => {
  // Prepare participants for saving (use avatarPath instead of data URL)
  const participantsToSave = participants.value.map(p => {
    const avatar = p.avatarPath || (p.avatar && !p.avatar.startsWith('data:') ? p.avatar : null);
    return {
      id: p.id,
      name: p.name,
      avatar: avatar, // Only save path, not data URL
      races: [...p.races], // Clone array
      disqualified: p.disqualified
    };
  });
  
  // Create a clean tournament object with only serializable data
  const updatedTournament = {
    id: props.tournament.id,
    name: props.tournament.name,
    createdAt: props.tournament.createdAt,
    status: props.tournament.status,
    currentRound: props.tournament.currentRound,
    icon: props.tournament.icon,
    colors: props.tournament.colors ? { ...props.tournament.colors } : undefined,
    participants: participantsToSave
  };
  
  console.log('QualifiersView emitting update with participants:', participantsToSave.length, participantsToSave);
  emit('update', updatedTournament);
};

const addTestParticipants = () => {
  const testParticipants = [
    { id: 1, name: 'Special Week', avatar: null, races: [null, null, null], disqualified: false },
    { id: 2, name: 'Silence Suzuka', avatar: null, races: [null, null, null], disqualified: false },
    { id: 3, name: 'Tokai Teio', avatar: null, races: [null, null, null], disqualified: false },
    { id: 4, name: 'Vodka', avatar: null, races: [null, null, null], disqualified: false },
    { id: 5, name: 'Daiwa Scarlet', avatar: null, races: [null, null, null], disqualified: false },
    { id: 6, name: 'Gold Ship', avatar: null, races: [null, null, null], disqualified: false },
  ];
  
  participants.value = testParticipants;
  emitUpdate();
};

// Drag and drop handlers
const handleDragOver = (e) => {
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  isDragging.value = false;
};

const handleDrop = async (e) => {
  isDragging.value = false;
  
  const files = Array.from(e.dataTransfer.files);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    showToast('Please drop image files only', 'error');
    return;
  }
  
  showToast(`Processing ${imageFiles.length} image(s)...`, 'info');
  
  for (const file of imageFiles) {
    await addParticipantFromImage(file);
  }
  
  showToast(`Added ${imageFiles.length} participant(s)`, 'success');
};

const addParticipantFromImage = async (file) => {
  try {
    // Read file as base64
    const reader = new FileReader();
    const fileData = await new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // Get filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    
    // Save image through electron
    if (window.electron?.tournaments) {
      const result = await window.electron.tournaments.saveParticipantImage(
        props.tournament.name,
        file.name,
        fileData
      );
      
      if (result.success) {
        // Create new participant with relative path
        const newParticipant = {
          id: Date.now() + Math.random(), // Unique ID
          name: nameWithoutExt,
          avatarPath: result.imagePath, // Store relative path
          avatar: fileData, // Store data URL for display
          races: [null, null, null],
          disqualified: false
        };
        
        participants.value.push(newParticipant);
        console.log('Added participant:', newParticipant.name, 'with path:', newParticipant.avatarPath);
        emitUpdate();
      } else {
        console.error('Error saving image:', result.error);
      }
    }
  } catch (error) {
    console.error('Error adding participant:', error);
  }
};
</script>

<style scoped>
.v-list {
  background: transparent;
}

.drop-zone {
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone.drag-over {
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px dashed var(--v-primary-base);
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);
}

.group-divider {
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--v-primary-base) 50%, 
    transparent 100%
  );
  border-color: transparent;
  margin: 20px !important;
}
</style>
