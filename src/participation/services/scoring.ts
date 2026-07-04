export interface GradableQuestion {
  points: number;
  correctOptionIds: string[];
  selectedOptionIds: string[];
}

const isSameSet = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  const target = new Set(b);
  return a.every((id) => target.has(id));
};

export const isAnswerCorrect = (correctOptionIds: string[], selectedOptionIds: string[]): boolean => isSameSet(correctOptionIds, selectedOptionIds);

export const scoreSubmission = (questions: GradableQuestion[]): number =>
  questions.reduce((total, question) => total + (isAnswerCorrect(question.correctOptionIds, question.selectedOptionIds) ? question.points : 0), 0);
