<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon class="mr-2" color="primary">mdi-cog</v-icon>
        Tournament Settings
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12">
            <h3 class="text-h6 mb-4">Theme Colors</h3>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <label class="text-subtitle-2 mb-2 d-block">Primary Color</label>
              <input
                type="color"
                v-model="localColors.primary"
                class="color-input"
              />
              <v-text-field
                v-model="localColors.primary"
                variant="outlined"
                density="compact"
                class="mt-2"
                hide-details
              ></v-text-field>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <label class="text-subtitle-2 mb-2 d-block">Background Color</label>
              <input
                type="color"
                v-model="localColors.background"
                class="color-input"
              />
              <v-text-field
                v-model="localColors.background"
                variant="outlined"
                density="compact"
                class="mt-2"
                hide-details
              ></v-text-field>
            </v-card>
          </v-col>
          
          <v-col cols="12">
            <v-card class="pa-4 mt-2" :style="previewStyle">
              <div class="text-center">
                <v-icon size="48" :color="localColors.primary">mdi-trophy</v-icon>
                <p class="mt-2">Color Preview</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSave"
          :loading="loading"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  tournament: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const dialog = ref(props.modelValue);
const loading = ref(false);

const localColors = ref({
  primary: '#FF69B4',
  background: '#1a1a2e'
});

const previewStyle = computed(() => ({
  backgroundColor: localColors.value.background,
  border: `2px solid ${localColors.value.primary}`
}));

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
  if (newVal && props.tournament) {
    // Load tournament colors
    localColors.value = {
      primary: props.tournament.colors?.primary || '#FF69B4',
      background: props.tournament.colors?.background || '#1a1a2e'
    };
  }
});

watch(dialog, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});

const handleCancel = () => {
  dialog.value = false;
};

const handleSave = async () => {
  loading.value = true;
  
  const updatedTournament = {
    ...props.tournament,
    colors: {
      primary: localColors.value.primary,
      background: localColors.value.background
    }
  };
  
  emit('save', updatedTournament);
  loading.value = false;
  dialog.value = false;
};
</script>

<style scoped>
.v-card-title {
  background: rgba(255, 255, 255, 0.05);
}

.color-input {
  width: 100%;
  height: 60px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-input:hover {
  border-color: rgba(255, 105, 180, 0.5);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 4px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>
