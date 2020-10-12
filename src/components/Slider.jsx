import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

// Building array of climbing grades
export const gradeList = [];
for (let n = 0; n < 15; n++) {
  const subGrade = n < 10 ? [""] : ["a", "b", "c", "d"];
  for (const letter of subGrade) {
    gradeList.push("5." + n.toString() + letter);
  }
}
gradeList.push("5.15a");

const gradeToNumberObject = gradeList.reduce(
  (acc, grade, index) => ({ ...acc, [grade]: index }),
  {}
);

// Building a function to deal with edge cases such as 5.12a/b and 5.8+
export const gradeToNumber = (grade) => {
  let number = gradeToNumberObject[grade];
  if (number === undefined) {
    if (grade[2] === "1") {
      // e.g. grade = 5.1xxxx
      number = gradeToNumberObject[grade.slice(0, 5)]; // truncating slash grade
      if (number === undefined) {
        // e.g. grade = 5.10-
        number = gradeToNumberObject[grade.slice(0, 4) + "a"]; // converting to 5.10a
      }
    } else {
      // e.g. grade = 5.8+
      number = gradeToNumberObject[grade.slice(0, 3)];
    }
  }
  return number;
};

export default (props) => (
  <div style={{ margin: 50 }}>
    <Range
      min={0}
      max={gradeList.length - 1}
      defaultValue={[0, gradeList.length - 1]}
      onChange={(value) => {
        props.setLower(value[0]);
        props.setUpper(value[1]);
      }}
      tipFormatter={(value) => gradeList[value]}
      // could use indexOf('5.10a') to find an initial index
      marks={[2, 6, 10, 14, 18, 22, 26, 30].reduce(
        (acc, cur) => ({ ...acc, [cur]: gradeList[cur] }),
        {}
      )}
    />
  </div>
);
