// File: src/utils/haptics.ts
import * as Haptics from 'expo-haptics';

export const impactLight = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // noop
  }
};

export const impactMedium = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // noop
  }
};

export const selectionAsync = async (): Promise<void> => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // noop
  }
};
