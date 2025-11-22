// app/data/education/voice-script.ts
export interface VoiceScript {
  game_title: string;
  description: string;
  language: string;
  script: VoiceEvent[];
}

export interface VoiceEvent {
  id: string;
  type: 'narration' | 'feedback_positive' | 'feedback_reflective';
  trigger: string;
  voice_line: string;
  tone: string;
  pause?: number;
}

export const NEEDS_WANTS_VOICE_SCRIPT: VoiceScript = {
  game_title: "La Scatola dei Tesori e delle Necessità",
  description: "Gioco educativo per insegnare la differenza tra bisogni e desideri",
  language: "it-IT",
  script: [
    {
      id: "intro",
      type: "narration",
      trigger: "game_start",
      voice_line: "Ciao piccolo esploratore! Oggi giocheremo con due scatole magiche: una per i bisogni, le cose che ci aiutano a vivere e stare bene, e una per i desideri, le cose che ci fanno sorridere ma non sono indispensabili. Pronto a cominciare?",
      tone: "calmo, accogliente, crescente in entusiasmo",
      pause: 1.0
    },
    {
      id: "need_correct",
      type: "feedback_positive", 
      trigger: "item_correct_box_need",
      voice_line: "Bravo! Hai scelto proprio bene. Questo è un bisogno: qualcosa che ci serve davvero per vivere e crescere in salute. Hai guadagnato un punto da vero esperto dei bisogni!",
      tone: "felice, motivante",
      pause: 0.8
    },
    {
      id: "need_wrong",
      type: "feedback_reflective",
      trigger: "item_wrong_box_need", 
      voice_line: "Mh… interessante scelta! Ma pensaci un attimo: possiamo vivere bene senza questo oggetto? Forse no... perché ci serve per stare bene ogni giorno. Proviamo a rimetterlo nella scatola giusta?",
      tone: "curioso, gentile, senza rimprovero",
      pause: 1.5
    },
    {
      id: "desire_correct",
      type: "feedback_positive",
      trigger: "item_correct_box_desire",
      voice_line: "Ottima scelta! Questo è un desiderio: non ci serve per vivere, ma rende la vita più allegra e piena di colore. Sapere la differenza è da veri pensatori curiosi!",
      tone: "vivace, giocoso, sincero",
      pause: 0.8
    },
    {
      id: "desire_wrong", 
      type: "feedback_reflective",
      trigger: "item_wrong_box_desire",
      voice_line: "Ops! Sembra importante, vero? Ma proviamo a pensarci… potremmo vivere anche senza questo? Allora sì, è un desiderio, non un bisogno! Hai ragionato bene: anche capire quando sbagli fa parte dell'imparare.",
      tone: "calmo, riflessivo, incoraggiante",
      pause: 1.2
    },
    {
      id: "level_complete",
      type: "narration", 
      trigger: "level_end",
      voice_line: "Wow! Hai completato la tua missione da esploratore dei tesori della vita! Ora sai che i bisogni sono le cose che ci aiutano a vivere bene e i desideri sono le cose che rendono la vita più felice.",
      tone: "caldo, celebrativo",
      pause: 1.5
    }
  ]
};