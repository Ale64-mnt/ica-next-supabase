"use client";

interface QuestionCardProps {
  question: {
    id: string;
    question_text: string;
    options: string[] | Record<string, string>;
    correct_answer: string;
    explanation?: string;
  };
  selectedAnswer: string | undefined;
  onSelectAnswer: (answer: string) => void;
  questionNumber: number;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
}: QuestionCardProps) {
  const options = Array.isArray(question.options)
    ? question.options
    : Object.values(question.options);

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div
      className="
        space-y-6
      "
      role="form"
      aria-labelledby={`question-${question.id}`}
    >
      <div>
        <h3
          id={`question-${question.id}`}
          className="
            text-lg 
            md:text-xl 
            lg:text-2xl 
            font-semibold 
            text-gray-900 
            mb-4
          "
        >
          <span
            className="
              inline-block 
              bg-blue-100 
              text-blue-700 
              px-3 
              py-1 
              rounded-lg 
              mr-3 
              text-sm 
              md:text-base
            "
            aria-hidden="true"
          >
            Q{questionNumber}
          </span>
          {question.question_text}
        </h3>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">
          Opzioni di risposta per la domanda {questionNumber}
        </legend>
        
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const optionId = `option-${question.id}-${index}`;
          
          return (
            <div key={optionId}>
              <input
                type="radio"
                id={optionId}
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => onSelectAnswer(option)}
                className="sr-only"
              />
              
              <label
                htmlFor={optionId}
                className={`
                  block 
                  p-4 
                  md:p-5 
                  border 
                  rounded-xl 
                  cursor-pointer 
                  transition-all 
                  duration-200
                  ${isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }
                  focus-within:ring-2 
                  focus-within:ring-blue-500
                  focus-within:border-transparent
                `}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div
                    className={`
                      flex-shrink-0
                      w-8 
                      h-8 
                      md:w-10 
                      md:h-10
                      rounded-lg 
                      flex 
                      items-center 
                      justify-center 
                      font-bold
                      text-sm 
                      md:text-base
                      ${isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700"
                      }
                    `}
                    aria-hidden="true"
                  >
                    {optionLabels[index]}
                  </div>
                  
                  <div className="flex-1">
                    <div
                      className={`
                        font-medium
                        text-sm 
                        md:text-base 
                        lg:text-lg
                        ${isSelected ? "text-blue-700" : "text-gray-900"}
                      `}
                    >
                      {option}
                    </div>
                    
                    {isSelected && question.explanation && (
                      <div
                        className="
                          mt-2 
                          p-3 
                          bg-blue-100 
                          border 
                          border-blue-200 
                          rounded-lg
                          text-sm 
                          text-blue-800
                        "
                        role="note"
                      >
                        <strong>Nota:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div
                      className="
                        flex-shrink-0 
                        text-blue-500 
                        text-lg 
                        md:text-xl
                      "
                      aria-hidden="true"
                    >
                      
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}
