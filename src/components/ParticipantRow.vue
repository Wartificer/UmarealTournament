<template>
  <v-list-item class="participant-row" :class="{ 'disqualified': participant.disqualified }">
    <template v-slot:prepend>
      <div class="d-flex align-center ga-2">
        <v-avatar size="56" class="mr-2">
          <v-img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name"></v-img>
          <v-icon v-else size="36">mdi-account</v-icon>
        </v-avatar>
        
        <div v-if="!isEditingName" @dblclick="startEditingName" class="name-display text-body-1">
          {{ participant.name }}
        </div>
        <v-text-field
          v-else
          v-model="editedName"
          @keyup.enter="saveName"
          @blur="cancelEdit"
          autofocus
          dense
          hide-details
          variant="underlined"
          class="name-input"
        ></v-text-field>
      </div>
    </template>

    <template v-slot:append>
      <div class="d-flex align-center ga-3">
        <!-- Race Result Circles -->
        <div class="race-circles d-flex ga-1">
          <v-tooltip 
            v-for="(race, index) in participant.races" 
            :key="index"
            location="top"
          >
            <template v-slot:activator="{ props: tooltipProps }">
              <div 
                class="race-circle"
                :class="getRaceCircleClass(race)"
                v-bind="tooltipProps"
                @click="cycleRaceState(index)"
              >
                <v-icon v-if="race !== null" size="14" color="white">
                  {{ getRaceIcon(race) }}
                </v-icon>
              </div>
            </template>
            <span>{{ getRaceTooltip(race, index) }}</span>
          </v-tooltip>
        </div>

        <!-- Total Points -->
        <div 
          class="points-display font-weight-bold"
          :class="{ 'qualified': isQualified }"
        >
          {{ totalPoints }}
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons d-flex ga-0">
          <v-btn
            :icon="participant.disqualified ? 'mdi-flag-checkered' : 'mdi-flag'"
            size="small"
            variant="text"
            :color="participant.disqualified ? 'success' : 'warning'"
            @click="handleDisqualify"
            density="compact"
          >
          </v-btn>

          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="error"
            @click="handleRemove"
            density="compact"
          >
          </v-btn>
        </div>
      </div>
    </template>
  </v-list-item>
  <v-divider></v-divider>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  participant: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update', 'disqualify', 'remove']);

const isEditingName = ref(false);
const editedName = ref('');

const totalPoints = computed(() => {
  if (!props.participant.races) return 0;
  return props.participant.races.reduce((sum, race) => sum + (race || 0), 0);
});

const isQualified = computed(() => {
  return props.rank > 0 && props.rank <= 27;
});

const getRaceCircleClass = (raceValue) => {
  if (raceValue === null) return 'empty';
  if (raceValue === 3) return 'gold';
  if (raceValue === 2) return 'silver';
  if (raceValue === 1) return 'bronze';
  return 'empty';
};

const getRaceIcon = (raceValue) => {
  if (raceValue === 3) return 'mdi-trophy';
  if (raceValue === 2) return 'mdi-medal';
  if (raceValue === 1) return 'mdi-medal-outline';
  return '';
};

const getRaceTooltip = (raceValue, index) => {
  const raceNum = index + 1;
  if (raceValue === null) return `Race ${raceNum}: Not set`;
  if (raceValue === 3) return `Race ${raceNum}: 1st Place (Gold - 3pts)`;
  if (raceValue === 2) return `Race ${raceNum}: 2nd Place (Silver - 2pts)`;
  if (raceValue === 1) return `Race ${raceNum}: 3rd Place (Bronze - 1pt)`;
  return `Race ${raceNum}`;
};

const cycleRaceState = (raceIndex) => {
  if (props.participant.disqualified) return;
  
  const updatedParticipant = { ...props.participant };
  const currentValue = updatedParticipant.races[raceIndex];
  
  // Cycle: null -> 3 (gold) -> 2 (silver) -> 1 (bronze) -> null
  if (currentValue === null) {
    updatedParticipant.races[raceIndex] = 3;
  } else if (currentValue === 3) {
    updatedParticipant.races[raceIndex] = 2;
  } else if (currentValue === 2) {
    updatedParticipant.races[raceIndex] = 1;
  } else {
    updatedParticipant.races[raceIndex] = null;
  }
  
  emit('update', updatedParticipant);
};

const handleDisqualify = () => {
  emit('disqualify', props.participant.id);
};

const handleRemove = () => {
  emit('remove', props.participant.id);
};

const startEditingName = () => {
  editedName.value = props.participant.name;
  isEditingName.value = true;
};

const saveName = () => {
  if (editedName.value.trim() && editedName.value !== props.participant.name) {
    const updatedParticipant = {
      ...props.participant,
      name: editedName.value.trim()
    };
    emit('update', updatedParticipant);
  }
  isEditingName.value = false;
};

const cancelEdit = () => {
  isEditingName.value = false;
};
</script>

<style scoped>
.participant-row {
  border-top-width: 1px !important;
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.participant-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.participant-row.disqualified {
  opacity: 0.5;
  background-color: rgba(255, 0, 0, 0.1);
}

.race-circles {
  min-width: 130px;
}

.race-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.race-circle:hover {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.race-circle.empty {
  background-color: rgba(255, 255, 255, 0.1);
}

.race-circle.gold {
  background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%);
  border-color: #B8860B;
  box-shadow: 0 0 10px rgba(184, 134, 11, 0.5);
}

.race-circle.silver {
  background: linear-gradient(135deg, #A8A8A8 0%, #8C8C8C 100%);
  border-color: #A8A8A8;
  box-shadow: 0 0 10px rgba(168, 168, 168, 0.5);
}

.race-circle.bronze {
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
  border-color: #8B4513;
  box-shadow: 0 0 10px rgba(139, 69, 19, 0.5);
}

.name-display {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.name-display:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.name-input {
  max-width: 300px;
}

.qualified {
  color: #4caf50;
  font-weight: 600;
}

.points-display{
  margin-right: 20px;
}
</style>
