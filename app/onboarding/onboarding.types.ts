export interface Option {
  label: string;
  value: string;
}

export const diagnosisOptions: Option[] = [
  { label: 'onboarding.diagnosis_options.adhd', value: 'ADHD' },
  {
    label: 'onboarding.diagnosis_options.down_syndrome',
    value: 'DownSyndrome',
  },
  { label: 'onboarding.diagnosis_options.autism', value: 'Autism' },
  { label: 'onboarding.diagnosis_options.speech_delay', value: 'SpeechDelay' },
  {
    label: 'onboarding.diagnosis_options.prefer_not_to_say',
    value: 'PreferNotToSay',
  },
  { label: 'onboarding.diagnosis_options.other', value: 'Other' },
];

export const developmentAreas: Option[] = [
  { label: 'onboarding.area_speech', value: 'speech' },
  { label: 'onboarding.area_social', value: 'social' },
  { label: 'onboarding.area_motor', value: 'motor' },
  { label: 'onboarding.area_cognitive', value: 'cognitive' },
  { label: 'onboarding.area_sensory', value: 'sensory' },
  { label: 'onboarding.area_behavior', value: 'behavior' },
];
