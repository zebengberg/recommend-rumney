import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

export default (props) => {
  // Building array of climbing grades
  const grades = [];
  for (let n = 0; n < 15; n++) {
    const subGrade = n < 10 ? [""] : ["a", "b", "c", "d"];
    for (const letter of subGrade) {
      grades.push("5." + n.toString() + letter);
    }
  }
  grades.push("5.15a");

  return (
    <div style={{ margin: 50 }}>
      <Range
        min={0}
        max={grades.length - 1}
        defaultValue={[0, grades.length - 1]}
        onChange={(value) => {
          props.setLower(value[0]);
          props.setUpper(value[1]);
        }}
        tipFormatter={(value) => grades[value]}
        marks={[2, 6, 10, 14, 18, 22, 26, 30].reduce(
          (acc, cur) => ({ ...acc, [cur]: grades[cur] }),
          {}
        )}
      />
    </div>
  );
};
