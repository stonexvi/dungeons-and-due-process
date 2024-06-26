import { useState } from 'react';
import DungeonsAndDueProcessLogo from './png/DungeonsAndDueProcessLogo.png';
import { ReactComponent as Mask} from './svg/mask.svg';
import './App.css';

/**
 * This is the error message that will be displayed if the infinite episode writer function fails.
 * @type {string}
 **/
const ERROR_MESSAGE = 'BLAST. Looks like a brood of dragons snatched the parcel on its way to you. Try again.';

const TOGGLE_OPTIONS = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  ESSAY: 'ESSAY'
};

/**
 * This is the URL for the dnd bar writer
 */
const DND_BAR_WRITER_URL = 'https://tuzftpau5kvve24s4oueo57dhe0esuls.lambda-url.us-east-1.on.aws/';

function renderTextWithMarkdown(text) {
  // Replace newline characters with <br /> tags
  let html = text.replace(/\n/g, '<br />');

  // Replace **text** with <b>text</b>
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // Replace **text** with <b>text</b>
  html = html.replace(/\*(.*?)\*/g, '<b>$1</b>');

  // Replace _text_ with <i>text</i>
  // html = html.replace(/_(.*?)_/g, '<i>$1</i>');

  // html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

  return html;
}

function App() {
  const [barQuestion, setBarQuestion] = useState('');
  const [barAnswer, setBarAnswer] = useState('');
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [questionType, setQuestionType] = useState(TOGGLE_OPTIONS.MULTIPLE_CHOICE);

  const revealAnswer = async () => {
    setAnswerRevealed(true);
  };

  const handleToggleOption = (event) => {
    console.log('Toggle option changed to: ', event.target.value);
    setQuestionType(event.target.value);
  }

  async function promptWriterForQuestion() {
    console.log(`Request issued for option: ${questionType}`);

    if (requestPending) {
      console.log('Existing request pending, try again later.');
    } else {
      try {
        // reset the current question and answer
        setBarQuestion('');
        setBarAnswer('');
        setAnswerRevealed(false);

        // establish that a request is pending
        setRequestPending(true);

        // start loading animation
        setBarQuestion('Loading...');
  
        const writerResponse = await fetch(DND_BAR_WRITER_URL, {
          method: 'POST',
          body: JSON.stringify({ questionType, }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Writer response: ', writerResponse);
  
        // parse the response body as JSON
        const writerResponseJson = await writerResponse.json();
        console.log('Writer Response JSON: ', writerResponseJson);
  
        if (writerResponseJson.statusCode === 200) {
          const barQuestionAndAnswer = writerResponseJson.barQuestion ? writerResponseJson.barQuestion.split('ANSWER HERE:') : [ ERROR_MESSAGE ];  
          console.log('Bar Question and Answer: ', barQuestionAndAnswer);
          setBarQuestion(barQuestionAndAnswer[0]);

          if (barQuestionAndAnswer.length > 1) {
            setBarAnswer(barQuestionAndAnswer[1].trim());
          }
        } else {
          setBarQuestion(ERROR_MESSAGE);
          setBarAnswer('');
        }
      } catch (error) {
        setBarQuestion(ERROR_MESSAGE);
        setBarAnswer('');
      }

      // reset the request pending status
      setRequestPending(false);
    }
  }

  return (
    <div className='container'>
      <div className='logo-container'>
        <img className='dndp-logo' src={DungeonsAndDueProcessLogo}/>
      </div>
      <p className='explanation'>Study up for the the next <b>bar</b>...barian assault!</p>
      <div className='wrapper'>
        <div className="custom-input">
          <input
            type='radio'
            id='multipleChoiceOption'
            name='questionType'
            value={TOGGLE_OPTIONS.MULTIPLE_CHOICE}
            onChange={handleToggleOption}
            defaultChecked
          />
          <label htmlFor='multipleChoiceOption'>
          <b>Multiple Choice</b>
          </label>
        </div>
        <div className="custom-input">
          <input
            type='radio'
            id='essayOption'
            name='questionType'
            value={TOGGLE_OPTIONS.ESSAY}
            onChange={handleToggleOption}
          />
          <label htmlFor='essayOption'>
          <b>Essay</b>
          </label>
        </div>
      </div>
      <button 
        className='themeButton'
        disabled={ requestPending ? true : false }
        onClick={ promptWriterForQuestion }>
          Fire away!
      </button>
      { barQuestion && <div className='barQuestion' dangerouslySetInnerHTML={{ __html: renderTextWithMarkdown(barQuestion) }} /> }
      { requestPending && <Mask className='funnel' />}
      { barQuestion && barAnswer && <button className='showAnswer' onClick={ revealAnswer }>Show Answer</button> }
      { barQuestion && barAnswer && answerRevealed && <div className='barQuestion' dangerouslySetInnerHTML={{ __html: renderTextWithMarkdown(barAnswer) }} /> }
    </div>
  );
}

export default App;
