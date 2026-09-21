// Vozes neurais do navegador (ex.: "Microsoft Francisca Online (Natural)" no Edge)
// soam bem melhores que as locais; são preferidas quando existem.
const NATURAL_VOICE = /natural|neural|online|francisca/i

export function choosePortugueseVoice(voices: SpeechSynthesisVoice[]) {
  const ptBR = voices.filter(voice => voice.lang.toLowerCase().replace('_', '-') === 'pt-br')
  return ptBR.find(voice => NATURAL_VOICE.test(voice.name))
    ?? ptBR[0]
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
