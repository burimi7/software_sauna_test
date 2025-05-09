import React, { ChangeEventHandler, FormEvent, ReactElement, useEffect, useState } from 'react';

// Constants for character representations
const START_CHARACTED = '@';
const END_CHARACTED = 'x';
const DIRECTIONAL_CHARACTERS = '+';
const CAN_UP_DOWN = '|';
const CAN_RIGHT_LEFT = '-';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Direction mappings to reduce string duplication and miswriting
const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

// Types
interface Coordinates {
  x: number,
  y: number
}

interface CellContent extends Coordinates {
  content: string;
}

type DirectionsType = typeof DIRECTIONS[keyof typeof DIRECTIONS];

function TheTest() {
  // State declarations
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [pastCoordinates, setPastCoordinates] = useState<Coordinates[]>([]);
  const [textAreaMap, setTextAreaMap] = useState<string[][]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [characters, setCharacters] = useState<CellContent[]>([]);
  const [generalLoops, setGeneralLoops] = useState(0);
  const [pastDirections, setPastDirections] = useState<string[]>([]);
  const [theLetters, setTheLetters] = useState('');

  /**
   * Retries the last direction if possible; otherwise, checks all directions.
   */
  const redoLastDirection = () => {
    const lastDirection = pastDirections[pastDirections.length - 1] as DirectionsType;
    const lastCoordinates = pastCoordinates[pastCoordinates.length - 1];

    if (
      (lastDirection === DIRECTIONS.DOWN && lastCoordinates.x < textAreaMap.length - 1) ||
      (lastDirection === DIRECTIONS.UP && lastCoordinates.x > 0) ||
      (lastDirection === DIRECTIONS.RIGHT && lastCoordinates.y < textAreaMap[0].length - 1) ||
      (lastDirection === DIRECTIONS.LEFT && lastCoordinates.y > 0)
    ) {
      goDirection(lastDirection);
    } else {
      checkFourDirections(lastCoordinates, textAreaMap);
    }
  };

  const canMove = (x: number, y: number, map: string[][]) => {
    const content = map?.[x]?.[y];
    return content && content !== ' ' && !findCoordinates({ x, y }) &&
      (content === CAN_UP_DOWN || content === CAN_RIGHT_LEFT || ALPHABET.includes(content) || content === DIRECTIONAL_CHARACTERS);
  };

  /**
   * Checks all four directions from the current cell for possible moves.
   * @param currentCell - Current coordinates.
   * @param map - The map to traverse.
   * @returns Possible directions and finish status.
   */
  const checkFourDirections = (currentCell: Coordinates, map: string[][]) => {
    const currentCellContent = map[currentCell.x][currentCell.y];

    const canUp = currentCellContent !== CAN_RIGHT_LEFT && canMove(currentCell.x - 1, currentCell.y, map);
    const canDown = currentCellContent !== CAN_RIGHT_LEFT && canMove(currentCell.x + 1, currentCell.y, map);
    const canRight = currentCellContent !== CAN_UP_DOWN && canMove(currentCell.x, currentCell.y + 1, map);
    const canLeft = currentCellContent !== CAN_UP_DOWN && canMove(currentCell.x, currentCell.y - 1, map);

    if (currentCellContent === END_CHARACTED) {
      setCharacters([...characters, { content: END_CHARACTED, ...currentCell }]);
      setTheLetters(Array.from(new Set(characters.filter(c => ALPHABET.includes(c.content)).map(c => JSON.stringify(c))))
        .map(c => JSON.parse(c).content).join(''));

      return { canDown: false, canUp: false, canLeft: false, canRight: false, isFinished: true };
    } else if (!canDown && !canUp && !canLeft && !canRight) {
      setCharacters([...characters, { content: currentCellContent, ...currentCell }]);
      redoLastDirection();
    }

    return { canDown, canUp, canLeft, canRight, isFinished: false };
  };

  /**
   * Checks if given coordinates were already visited.
   * @param coords - Coordinates to check.
   * @returns True if already visited.
   */
  const findCoordinates = (coords: Coordinates): boolean => {
    return !!pastCoordinates.find(c => c.x === coords.x && c.y === coords.y);
  };

  /**
   * Evaluates possible directions from the last coordinate.
   * @param map - Current map.
   */
  const loopSerching = (map: string[][]) => {
    const lastCoordinate = pastCoordinates[pastCoordinates.length - 1];
    const check = checkFourDirections(lastCoordinate, map);
    if (check.isFinished) return;

    if (check.canDown) goDirection(DIRECTIONS.DOWN);
    else if (check.canUp) goDirection(DIRECTIONS.UP);
    else if (check.canLeft) goDirection(DIRECTIONS.LEFT);
    else if (check.canRight) goDirection(DIRECTIONS.RIGHT);
  };

  /**
   * Normalizes and sets the map from textarea input.
   */
  const startCalculation = () => {
    const map: string[][] = textAreaValue.split('\n').map(line => line.split(''));
    const maxLength = Math.max(...map.map(row => row.length));
    const mapNormalized = map.map(row => [...row, ...Array(maxLength - row.length).fill(' ')]);
    setTextAreaMap(mapNormalized);
  };

  useEffect(() => {
    if (textAreaMap.length > 0) {
      const allStarts = findBeginningChar(textAreaMap, START_CHARACTED);
      const allEnds = findBeginningChar(textAreaMap, END_CHARACTED);
      const start = allStarts[0];

      if (allStarts.length !== 1 || allEnds.length !== 1) {
        setActivities([...activities, 'Error']);
      } else {
        setPastCoordinates([...pastCoordinates, start]);
      }
    }
  }, [JSON.stringify(textAreaMap)]);

  useEffect(() => {
    if (pastCoordinates.length > 0) {
      const last = pastCoordinates[pastCoordinates.length - 1];
      setCharacters([...characters, { content: textAreaMap[last.x][last.y], ...last }]);
      setGeneralLoops(generalLoops + 1);
      loopSerching(textAreaMap);
    }
  }, [JSON.stringify(pastCoordinates)]);

  /**
   * Sets the textarea value.
   * @param event - Form event with new value.
   */
  const setTextAreaValueHandler = (event: FormEvent) => {
    const value = (event.target as HTMLInputElement).value;
    setTextAreaValue(value);
  };

  /**
   * Finds coordinates of a specific character in the map.
   * @param map - The map to search.
   * @param char - The character to find.
   * @returns Array of coordinates.
   */
  const findBeginningChar = (map: string[][], char: string): Coordinates[] => {
    const result: Coordinates[] = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[0].length; j++) {
        if (map[i][j] === char) result.push({ x: i, y: j });
      }
    }
    return result;
  };

  /**
   * Moves in the given direction from the current position.
   * @param direction - Direction to move.
   * @param steps - Number of steps to move (default is 1).
   */
  const goDirection = (direction: DirectionsType, steps: number = 1) => {
    const last = pastCoordinates[pastCoordinates.length - steps];
    const current = textAreaMap[last.x][last.y];
    const lastDir = pastDirections[pastDirections.length - 1];

    if (current === DIRECTIONAL_CHARACTERS && lastDir === direction) {
      setActivities(['Error']);
      return;
    }

    const next: Coordinates = {
      x: direction === DIRECTIONS.UP ? last.x - steps : direction === DIRECTIONS.DOWN ? last.x + steps : last.x,
      y: direction === DIRECTIONS.LEFT ? last.y - steps : direction === DIRECTIONS.RIGHT ? last.y + steps : last.y
    };

    setPastCoordinates([...pastCoordinates, next]);
    setPastDirections([...pastDirections, direction]);
  };

  /**
   * Wrapper for the textarea input event handler.
   * @param e - Input event.
   */
  const setTextAreaValueHandlerMethod = (e: any) => {
    setTextAreaValueHandler(e);
  };

  /**
   * Removes duplicates from a list of cell contents and returns them as labels.
   * @param list - List of cell contents.
   * @returns React elements.
   */
  const removeDuplicates = (list: CellContent[]): ReactElement[] => {
    return Array.from(new Set(list.map(c => JSON.stringify(c))))
      .map(c => JSON.parse(c))
      .map(c => <label>{c.content}</label>);
  };

  return (
    <div className="App">
      <button onClick={() => startCalculation()}>Start</button>
      <br />
      <textarea onInput={e => setTextAreaValueHandlerMethod(e)} rows={10}> </textarea>
      <br /><br />
      {activities.length > 0 && (
        <div>Result: {activities.map((a, i) => <label key={i}>{a}</label>)}</div>
      )}
      <b>Letters:</b><label>{theLetters}</label><br />
      <b>Path as characters:</b>{removeDuplicates(characters)}<br />
    </div>
  );
}

export default TheTest;
