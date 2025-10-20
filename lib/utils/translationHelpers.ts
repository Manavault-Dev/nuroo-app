import { TFunction } from 'i18next';

const diagnosisValueToKey: Record<string, string> = {
  ADHD: 'onboarding.diagnosis_options.adhd',
  DownSyndrome: 'onboarding.diagnosis_options.down_syndrome',
  Autism: 'onboarding.diagnosis_options.autism',
  SpeechDelay: 'onboarding.diagnosis_options.speech_delay',
  PreferNotToSay: 'onboarding.diagnosis_options.prefer_not_to_say',
  Other: 'onboarding.diagnosis_options.other',
};

const developmentAreaValueToKey: Record<string, string> = {
  speech: 'onboarding.development_areas_options.speech',
  social: 'onboarding.development_areas_options.social',
  motor: 'onboarding.development_areas_options.motor',
  cognitive: 'onboarding.development_areas_options.cognitive',
  sensory: 'onboarding.development_areas_options.sensory',
  behavior: 'onboarding.development_areas_options.behavior',
};

export const translateDiagnosis = (diagnosis: string, t: TFunction): string => {
  const translationKey = diagnosisValueToKey[diagnosis];
  return translationKey ? t(translationKey) : diagnosis;
};

export const translateDevelopmentArea = (
  area: string,
  t: TFunction,
): string => {
  const translationKey = developmentAreaValueToKey[area];
  return translationKey ? t(translationKey) : area;
};

export const translateDevelopmentAreas = (
  areas: string[],
  t: TFunction,
): string[] => {
  return areas.map((area) => translateDevelopmentArea(area, t));
};
