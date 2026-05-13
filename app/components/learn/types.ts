export interface Case {
  id: number;
  title: string;
  content: string;
  formula: string;
  initMoves?: string[];
}

export interface SubStep {
  title: string;
  content: string;
  formula?: string;
  cases?: Case[];
}

export interface Step {
  id: number;
  title: string;
  subSteps: SubStep[];
  color: string;
  border: string;
}
