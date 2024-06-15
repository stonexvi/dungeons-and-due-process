import OpenAI from 'openai';

const OPENAI_API_KEY = 'sk-infinity-period-service-xFcYEhkCHBK9uyQWReE3T3BlbkFJqIGx3ubnAuDDRP9VYHXE';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // This is the default and can be omitted
});

/**
 * Handles the incoming event and context from the AWS Lambda function.
 * 
 * @param {object} event - The incoming event.
 * 
 * @returns {Promise<void>} - A promise that resolves when the function is complete.
 */
export async function handle(event) {
  const response = {
    statusCode: 200,
    errors: [],
    barQuestion: null,
  };

  let requestBody = {};

  if (event.body) {
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      response.statusCode = 400;
      response.errors.push({
        code: 'INVALID_REQUEST_BODY',
        message: 'The request body is invalid.',
      })
    }
  }
  
  const questionType = requestBody.questionType ?? 'MULTIPLE_CHOICE';

  const chatCompletion = await openai.chat.completions.create({
    messages: [
        { role: 'system', content: 'You are an expert in all 5th edition dungeons and dragons rulings. You are also an expert in the law and in how to write questions for the bar exam.' },
        { role: 'system', content: 'Please write a bar exam style question about the rules of Dungeons and Dragons, 5th edition. It should be formatted just like the bar exam. Write nothing special before your question, but after your question, add a newline, then say "ANSWER HERE:", add another newline, and then write your answer to the question and your reasoning' },
        { role: 'system', content: 'You now have everything you need to write your Dungeons and Dragons bar exam question. Please choose to write either a multiple choice question or an essay question base on what the user decides.' },
        { role: 'user', content: `The type of question I would like is: ${questionType}` }
    ],
    model: 'gpt-4o',
  });

  console.log('Chat completion is', chatCompletion);

  // check if chat completion is successful
  if (
    chatCompletion?.choices?.length
    && chatCompletion.choices[0]?.finish_reason === 'stop'
  ) {
    // take the first choice
    response.barQuestion = chatCompletion.choices[0]?.message?.content;
  } else {
    response.errors.push({
      code: 'CHAT_COMPLETION_FAILED',
      message: 'Chat completion failed.',
    });
  }

  return JSON.stringify(response);
}