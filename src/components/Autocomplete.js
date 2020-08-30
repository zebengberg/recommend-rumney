import React, { useState } from "react";
import Autocomplete from "react-autocomplete";

export default (props) => {
  const [value, setValue] = useState("");
  return (
    <Autocomplete
      items={props.items}
      getItemValue={(item) => item[props.itemKey]}
      renderItem={(item, isHighlighted) => (
        <div
          style={{ background: isHighlighted ? "lightgray" : "white" }}
          key={item[props.itemKey]}
        >
          {item[props.itemKey]}
        </div>
      )}
      value={value}
      wrapperStyle={{ position: "relative", display: "inline-block" }}
      shouldItemRender={(item, value) =>
        item[props.itemKey].toLowerCase().indexOf(value.toLowerCase()) !== -1
      }
      // See sortStates documentation here:
      // https://github.com/reactjs/react-autocomplete/blob/master/lib/utils.js
      sortItems={(a, b, v) => {
        const aLower = a[props.itemKey].toLowerCase();
        const bLower = b[props.itemKey].toLowerCase();
        const vLower = v.toLowerCase();
        const queryPosA = aLower.indexOf(vLower);
        const queryPosB = bLower.indexOf(vLower);
        if (queryPosA !== queryPosB) {
          return queryPosA - queryPosB;
        }
        return aLower[props.sortKey] < bLower[props.sortKey] ? -1 : 1;
      }}
      onChange={(_, v) => setValue(v)}
      onSelect={(_, item) => {
        setValue(item[props.itemKey]);
        props.setSelected({
          item: item[props.itemKey],
          measure: item[props.sortKey],
        });
      }}
      menuStyle={{
        borderRadius: "3px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
        background: "rgba(255, 255, 255, 0.9)",
        padding: "2px 0",
        fontSize: "90%",
        position: "fixed",
        overflow: "auto",
        maxHeight: "50%", // TODO: don't cheat, let it flow to the bottom
        zIndex: "998",
      }}
    />
  );
};
