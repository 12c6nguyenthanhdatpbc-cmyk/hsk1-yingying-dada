import coursesData from './courses.json';
import hsk1Lesson01 from './hsk1/lesson-01.json';
import hsk1Lesson02 from './hsk1/lesson-02.json';
import hsk1Lesson03 from './hsk1/lesson-03.json';
import hsk1Lesson04 from './hsk1/lesson-04.json';
import hsk1Lesson05 from './hsk1/lesson-05.json';
import hsk1Lesson06 from './hsk1/lesson-06.json';
import hsk1Lesson07 from './hsk1/lesson-07.json';
import hsk1Lesson08 from './hsk1/lesson-08.json';
import hsk1Lesson09 from './hsk1/lesson-09.json';
import hsk1Lesson10 from './hsk1/lesson-10.json';
import hsk1Lesson11 from './hsk1/lesson-11.json';
import hsk1Lesson12 from './hsk1/lesson-12.json';
import hsk1Lesson13 from './hsk1/lesson-13.json';
import hsk1Lesson14 from './hsk1/lesson-14.json';
import hsk1Lesson15 from './hsk1/lesson-15.json';
import listeningData from './listening.json';
import templateLesson from './lesson-schema-template.json';
import { Course, Lesson, ListeningItem } from '../types/curriculum';

export const DEFAULT_COURSES: Course[] = coursesData as Course[];
export const DEFAULT_LESSONS: Lesson[] = [
  hsk1Lesson01,
  hsk1Lesson02,
  hsk1Lesson03,
  hsk1Lesson04,
  hsk1Lesson05,
  hsk1Lesson06,
  hsk1Lesson07,
  hsk1Lesson08,
  hsk1Lesson09,
  hsk1Lesson10,
  hsk1Lesson11,
  hsk1Lesson12,
  hsk1Lesson13,
  hsk1Lesson14,
  hsk1Lesson15,
] as Lesson[];
export const DEFAULT_LISTENING: ListeningItem[] = listeningData as ListeningItem[];
export const LESSON_JSON_TEMPLATE: Lesson = templateLesson as Lesson;
