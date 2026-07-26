export type AdvTone = 'comedy' | 'romance' | 'horror'

export interface AdvChoice {
  label: string
  next: string
  flag?: string
}

export interface AdvNode {
  id: string
  speaker: string
  lines: string[]
  tone: AdvTone
  choices?: AdvChoice[]
  next?: string
  flag?: string
}

export interface AdvScript {
  stageAfter: number
  start: string
  nodes: Record<string, AdvNode>
}

/** Short ADV inserted after clearing stages 1,3,5,7 */
export const ADV_SCRIPTS: AdvScript[] = [
  {
    stageAfter: 1,
    start: 'a1',
    nodes: {
      a1: {
        id: 'a1',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['HEY WOODCUTTER...', 'NICE SWING.'],
        choices: [
          { label: 'THANKS', next: 'a2nice' },
          { label: 'WHO?', next: 'a2who' },
        ],
      },
      a2nice: {
        id: 'a2nice',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['I AM TORIKO.', 'TRY NOT TO EAT... MY GIFTS.'],
        next: 'end',
      },
      a2who: {
        id: 'a2who',
        speaker: 'TORIKO',
        tone: 'comedy',
        lines: ['A BIRD. OBVIOUSLY.', 'THE WHITE STUFF IS... ART.'],
        next: 'end',
      },
      end: {
        id: 'end',
        speaker: 'MOSAKU',
        tone: 'comedy',
        lines: ['...OK.'],
      },
    },
  },
  {
    stageAfter: 3,
    start: 'b1',
    nodes: {
      b1: {
        id: 'b1',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['WANT A LUNCH BREAK?', 'I MADE BENTO.'],
        choices: [
          { label: 'EAT', next: 'b2eat' },
          { label: 'WORK', next: 'b2work' },
        ],
      },
      b2eat: {
        id: 'b2eat',
        speaker: 'MOSAKU',
        tone: 'comedy',
        lines: ['IT TASTES LIKE...', 'REGRET AND SEEDS.'],
        next: 'end',
      },
      b2work: {
        id: 'b2work',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['DILIGENT.', 'KIND OF HOT.'],
        next: 'end',
      },
      end: {
        id: 'end',
        speaker: 'SYSTEM',
        tone: 'comedy',
        lines: ['BACK TO CHOPPING.'],
      },
    },
  },
  {
    stageAfter: 5,
    start: 'c1',
    nodes: {
      c1: {
        id: 'c1',
        speaker: '???',
        tone: 'horror',
        lines: ['THE FOREST IS QUIET.', 'TOO QUIET.'],
        choices: [
          { label: 'LOOK', next: 'c2look' },
          { label: 'RUN', next: 'c2run' },
        ],
      },
      c2look: {
        id: 'c2look',
        speaker: 'TORIKO',
        tone: 'horror',
        lines: ['DO NOT STARE', 'AT THE TREES TOO LONG.'],
        flag: 'horror_look',
        next: 'end',
      },
      c2run: {
        id: 'c2run',
        speaker: 'MOSAKU',
        tone: 'comedy',
        lines: ['LEGS SAY NO.', 'AXE SAYS YES.'],
        next: 'end',
      },
      end: {
        id: 'end',
        speaker: 'SYSTEM',
        tone: 'horror',
        lines: ['SOMETHING WATCHES.'],
      },
    },
  },
  {
    stageAfter: 7,
    start: 'd1',
    nodes: {
      d1: {
        id: 'd1',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['IF YOU FINISH...', 'MEET ME AT THE STUMP.'],
        choices: [
          { label: 'PROMISE', next: 'd2yes' },
          { label: 'MAYBE', next: 'd2maybe' },
        ],
      },
      d2yes: {
        id: 'd2yes',
        speaker: 'TORIKO',
        tone: 'romance',
        lines: ['THEN CHOP TRUE.', 'I WILL WAIT.'],
        flag: 'date',
        next: 'end',
      },
      d2maybe: {
        id: 'd2maybe',
        speaker: 'TORIKO',
        tone: 'horror',
        lines: ['MAYBE IS A CURSE', 'IN THIS WOOD.'],
        flag: 'cursed',
        next: 'end',
      },
      end: {
        id: 'end',
        speaker: 'SYSTEM',
        tone: 'comedy',
        lines: ['FINAL WOODS AHEAD.'],
      },
    },
  },
]

export function scriptAfterStage(stageId: number): AdvScript | undefined {
  return ADV_SCRIPTS.find((s) => s.stageAfter === stageId)
}
