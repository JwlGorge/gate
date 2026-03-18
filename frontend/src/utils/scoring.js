export const calculateScore = (questions, answers) => {
  let totalMarks = 0;
  let correctCount = 0;
  let totalAttempted = 0;

  questions.forEach((q, index) => {
    const qNum = parseInt(q.question_number);
    const userAnswer = answers[qNum];
    
    // Determine section and weight based on requirements
    let weight = 0;
    let negativeMark = 0;
    
    // Marking scheme mapping
    if (qNum <= 10 && q.question_type === 'MCQ') {
      weight = 1;
      negativeMark = 1/3;
    } else if (qNum <= 30 && q.question_type === 'MCQ') {
      weight = 2;
      negativeMark = 2/3;
    } else if (q.question_type === 'MSQ') {
      weight = 2; // Section B: 10 MSQs carrying 2 marks each
      negativeMark = 0;
    } else if (q.question_type === 'NAT') {
      // Section C: 10 of 1 mark, 10 of 2 marks
      // Mapping 41-50 to 1 mark, 51-60 to 2 marks
      if (qNum <= 50) {
        weight = 1;
      } else {
        weight = 2;
      }
      negativeMark = 0;
    } else if (q.question_type === 'MCQ') {
      // Fallback for MCQs after 30
      weight = 2;
      negativeMark = 2/3;
    }

    if (userAnswer === undefined || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      return; // Not attempted
    }

    totalAttempted++;

    if (q.question_type === 'MCQ') {
      if (userAnswer === q.answer) {
        totalMarks += weight;
        correctCount++;
      } else {
        totalMarks -= negativeMark;
      }
    } else if (q.question_type === 'MSQ') {
      // Answer in JSON is "A, C"
      const correctAnswers = q.answer.split(',').map(a => a.trim()).sort();
      const userAnswersArr = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer];
      
      if (JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArr)) {
        totalMarks += weight;
        correctCount++;
      }
    } else if (q.question_type === 'NAT') {
      // NAT answer in JSON can be "range-range" or just "value"
      const val = parseFloat(userAnswer);
      if (q.answer.includes('-')) {
        const [min, max] = q.answer.split('-').map(a => parseFloat(a.trim()));
        if (val >= min && val <= max) {
          totalMarks += weight;
          correctCount++;
        }
      } else {
        if (val === parseFloat(q.answer)) {
          totalMarks += weight;
          correctCount++;
        }
      }
    }
  });

  const accuracy = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0;
  return {
    score: parseFloat(totalMarks.toFixed(2)),
    accuracy: parseFloat(accuracy.toFixed(2)),
    totalAttempted,
    correctCount
  };
};
