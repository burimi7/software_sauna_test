import React, { ChangeEventHandler, FormEvent, ReactElement, useEffect, useState } from 'react';

const START_CHARACTED = '@';
const END_CHARACTED = 'x';
const DIRECTIONAL_CHARACTERS = '+';
const CAN_UP_DOWN = '|'
const CAN_RIGHT_LEFT = '-';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface Coordinates {
  x: number,
  y: number
}
interface CellContent extends Coordinates {
  content: string;
}
type DirectionsType = 'up' | 'down' | 'left' | 'right'


function TheTest() {
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [pastCoordinates, setPastCoordinates] = useState<Coordinates[]>([]);
  const [textAreaMap, setTextAreaMap] = useState<string[][]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [characters, setCharacters] = useState<CellContent[]>([]);
  const [generalLoops, setGeneralLoops] = useState(0);
  const [pastDirections, setPastDirections] = useState<string[]>([]);
  const [theLetters, setTheLetters] = useState('');

  const redoLastDirection = () => {
    const lastDirection = pastDirections[pastDirections.length - 1] as DirectionsType;
    const lastCoordinates = pastCoordinates[pastCoordinates.length - 1];

    if (
      (lastDirection === 'down' && lastCoordinates.x < textAreaMap.length - 1) ||
      (lastDirection === 'up' && lastCoordinates.x > 0) ||
      (lastDirection === 'right' && lastCoordinates.y < textAreaMap[0].length - 1) ||
      (lastDirection === 'left' && lastCoordinates.y > 0)
    ) {
      goDirection(pastDirections[pastDirections.length - 1] as DirectionsType);
    } else {
      checkFourDirections(lastCoordinates, textAreaMap);
    }

  }

  const checkFourDirections = (currentCell: Coordinates, map: string[][]) => {
    const currentCellContent = map[currentCell.x][currentCell.y];

    const canUp = currentCellContent === CAN_RIGHT_LEFT ? false : !!map?.[currentCell.x - 1]?.[currentCell.y] ? map[currentCell.x - 1][currentCell.y] !== ' ' && !findCoordinates({ x: currentCell.x - 1, y: currentCell.y }) && (map[currentCell.x - 1][currentCell.y] === CAN_UP_DOWN || ALPHABET.includes(map[currentCell.x - 1][currentCell.y]) || DIRECTIONAL_CHARACTERS === map[currentCell.x - 1][currentCell.y]) ? true : false : false;
    const canDown = currentCellContent === CAN_RIGHT_LEFT ? false : !!map?.[currentCell.x + 1]?.[currentCell.y] ? map[currentCell.x + 1][currentCell.y] !== ' ' && !findCoordinates({ x: currentCell.x + 1, y: currentCell.y }) && (map[currentCell.x + 1][currentCell.y] === CAN_UP_DOWN || ALPHABET.includes(map[currentCell.x + 1][currentCell.y]) || DIRECTIONAL_CHARACTERS === map[currentCell.x + 1][currentCell.y]) ? true : false : false;
    const canRight = currentCellContent === CAN_UP_DOWN ? false : !!map?.[currentCell.x]?.[currentCell.y + 1] ? map[currentCell.x][currentCell.y + 1] !== ' ' && !findCoordinates({ x: currentCell.x, y: currentCell.y + 1 }) && (map[currentCell.x][currentCell.y + 1] === CAN_RIGHT_LEFT || ALPHABET.includes(map[currentCell.x][currentCell.y + 1]) || DIRECTIONAL_CHARACTERS === map[currentCell.x][currentCell.y + 1]) ? true : false : false;
    const canLeft = currentCellContent === CAN_UP_DOWN ? false : !!map?.[currentCell.x]?.[currentCell.y - 1] ? map[currentCell.x][currentCell.y - 1] !== ' ' && !findCoordinates({ x: currentCell.x, y: currentCell.y - 1 }) && (map[currentCell.x][currentCell.y - 1] === CAN_RIGHT_LEFT || ALPHABET.includes(map[currentCell.x][currentCell.y - 1]) || DIRECTIONAL_CHARACTERS === map[currentCell.x][currentCell.y - 1]) ? true : false : false;

    if (currentCellContent === END_CHARACTED) {
      setCharacters([...characters, { content: END_CHARACTED, ...currentCell }]);

      // const chaa = characters;
      setTheLetters(
        Array.from(new Set(characters.filter(c => ALPHABET.includes(c.content)).map(c => JSON.stringify(c)))).map(c => JSON.parse(c).content).join('')
      )

      return { canDown: false, canUp: false, canLeft: false, canRight: false, isFinished: true };

    } else if (!canDown && !canUp && !canLeft && !canRight && currentCellContent === END_CHARACTED) {

      // const chaa = characters;
      setTheLetters(
        Array.from(new Set(characters.filter(c => ALPHABET.includes(c.content)).map(c => JSON.stringify(c)))).map(c => JSON.parse(c).content).join('')
      )
      return { canDown, canUp, canLeft, canRight, isFinished: true };
    } else if (!canDown && !canUp && !canLeft && !canRight) {
      setCharacters([...characters, { content: currentCellContent, ...currentCell }]);
      redoLastDirection();
    }

    return {
      canDown: map[currentCell.x]?.[currentCell.y] === CAN_RIGHT_LEFT ? false : canDown,
      canUp: map[currentCell.x]?.[currentCell.y] === CAN_RIGHT_LEFT ? false : canUp,
      canLeft: map[currentCell.x]?.[currentCell.y] === CAN_UP_DOWN ? false : canLeft,
      canRight: map[currentCell.x]?.[currentCell.y] === CAN_UP_DOWN ? false : canRight,
      isFinished: false
    };

  }

  const findCoordinates = (coords: Coordinates): boolean => {
    return !!pastCoordinates.find(c => c.x === coords.x && c.y === coords.y);
  }

  const loopSerching = (map: string[][]) => {

    const lastCoordinate = pastCoordinates[pastCoordinates.length - 1];

    const checkDirectionToGo = checkFourDirections(lastCoordinate, map);
    if (checkDirectionToGo.isFinished) {
      return;
    }

    if (checkDirectionToGo.canDown) { goDirection('down') }
    else if (checkDirectionToGo.canUp) { goDirection('up') }
    else if (checkDirectionToGo.canLeft) { goDirection('left') }
    else if (checkDirectionToGo.canRight) { goDirection('right') }
  }


  const startCalculation = () => {
    const map: string[][] = textAreaValue
      .split('\n')                     // Split into lines
      .map(line => line.split(''));    // Split each line into characters

    // Find the maximum row length
    const maxLength = Math.max(...map.map(row => row.length));

    // Pad each row with spaces to make all rows the same length
    const mapNormalized = map.map(row => {
      const paddedRow = [...row];
      while (paddedRow.length < maxLength) {
        paddedRow.push(' ');
      }
      return paddedRow;
    });

    setTextAreaMap(mapNormalized);

  }

  useEffect(() => {
    if (textAreaMap.length > 0) {
      const allStarts = findBeginningChar(textAreaMap, START_CHARACTED);
      const allEnds = findBeginningChar(textAreaMap, END_CHARACTED);
      const startCoordnate = allStarts[0];
      if (allStarts.length !== 1 || allEnds.length !== 1) {
        setActivities([...activities, 'Error']);
        return;
      } else {
        //Set the initial coordinates to the past coordinates
        setPastCoordinates([...pastCoordinates, startCoordnate]);
      }
    }

  }, [JSON.stringify(textAreaMap)]);

  useEffect(() => {
    if (pastCoordinates.length > 0) {
      const lastCoordinate = pastCoordinates[pastCoordinates.length - 1];
      const chaa = characters;
      chaa.push({ content: textAreaMap[lastCoordinate.x][lastCoordinate.y], ...lastCoordinate })

      setCharacters(chaa)
      setGeneralLoops(generalLoops + 1);

      loopSerching(textAreaMap);
    }

  }, [JSON.stringify(pastCoordinates)])

  const setTextAreaValueHandler = (event: FormEvent) => {
    const theValue = (event.target as HTMLInputElement).value
    setTextAreaValue(theValue);

  }

  const findBeginningChar = (map: string[][], char: string): Coordinates[] => {
    const allStarts = [];
    const lengthFirstRow = map.length ? map[0].length : 0;
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < lengthFirstRow; j++) {

        const currentCell = map[i][j];
        if (currentCell === char) {
          allStarts.push({ x: i, y: j });
        }

      }

    }
    return allStarts;
  };

  const goDirection = (direction: DirectionsType, steps: number = 1) => {

    const lastCoordinate = pastCoordinates[pastCoordinates.length - steps];

    const currentCell = textAreaMap[lastCoordinate.x][lastCoordinate.y];
    const lastDirection = pastDirections[pastDirections.length - 1];

    if (currentCell === DIRECTIONAL_CHARACTERS && lastDirection === direction) {
      setActivities(['Error'])
      return;
    }

    setPastCoordinates([...pastCoordinates,
    {
      x: direction === 'up' ? lastCoordinate.x - steps : direction === 'down' ? lastCoordinate.x + steps : lastCoordinate.x,
      y: direction === 'left' ? lastCoordinate.y - steps : direction === 'right' ? lastCoordinate.y + steps : lastCoordinate.y,

    }]);

    setPastDirections([...pastDirections, direction])
  }

  const setTextAreaValueHandlerMethod = (e: any) => {
    setTextAreaValueHandler(e)
  }

  const removeDuplicates = (list: CellContent[]): ReactElement[] => {
    return Array.from(new Set(list
      .map(c => JSON.stringify(c))))
      .map(c => JSON.parse(c))
      .map(c => <label>{c.content}</label>)

  }

  return (
    <div className="App">
      <button onClick={() => startCalculation()}>Start</button>
      <br />
      <br />
      <textarea onInput={e => setTextAreaValueHandlerMethod(e)} rows={10}> </textarea>
      <br /><br />
      {activities.length > 0 && (
        <div>Result: {activities.map((a, i) => <label key={i}>{a}</label>)}</div>
      )}
      <b>Letters:</b> <label>{theLetters}</label><br />
      <b>Path as characters:</b> {removeDuplicates(characters)}<br />
    </div>
  );
}

export default TheTest;
