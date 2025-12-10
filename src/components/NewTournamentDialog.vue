<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon class="mr-2" color="primary">mdi-trophy-award</v-icon>
        Create New Tournament
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-6">
        <v-text-field
          v-model="tournamentName"
          label="Tournament Name"
          placeholder="Enter tournament name..."
          variant="outlined"
          :error-messages="errorMessage"
          autofocus
          @keyup.enter="handleSubmit"
          @input="errorMessage = ''"
        ></v-text-field>
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
          @click="handleSubmit"
          :loading="loading"
          :disabled="!tournamentName.trim()"
        >
          Create Tournament
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'created']);

const dialog = ref(props.modelValue);
const tournamentName = ref('');
const errorMessage = ref('');
const loading = ref(false);

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
  if (newVal) {
    // Reset form when dialog opens
    tournamentName.value = '';
    errorMessage.value = '';
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

const handleSubmit = async () => {
  const name = tournamentName.value.trim();
  
  if (!name) {
    errorMessage.value = 'Tournament name is required';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    emit('created', name);
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred';
  } finally {
    loading.value = false;
  }
};

const setError = (message) => {
  errorMessage.value = message;
  loading.value = false;
};

defineExpose({
  setError
});
</script>

<style scoped>
.v-card-title {
  background: rgba(255, 255, 255, 0.05);
}
</style>
