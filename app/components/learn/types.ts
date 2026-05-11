export interface SubStep {
  title: string;
  content: string;
  formula?: string;
}

export interface Step {
  id: number;
  title: string;
  subSteps: SubStep[];
  color: string;
  border: string;
}
