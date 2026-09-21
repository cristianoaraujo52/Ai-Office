export function choosePortugueseVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find(voice => voice.lang.toLowerCase() === 'pt-br')
    ?? voices.find(voice => voice.lang.toLowerCase().startsWith('pt'))
}

export function createFlipbookUtterance(
  text: string,
  voices: SpeechSynthesisVoice[] = [],
) {
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = choosePortugueseVoice(voices)
  utterance.lang = voice?.lang ?? 'pt-BR'
  utterance.voice = voice ?? null
  utterance.rate = 0.92
  utterance.pitch = 1
  return utterance
}

export function supportsSpeech() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof SpeechSynthesisUtterance !== 'undefined'
}
