import React, { useState } from "react";
import Autocomplete from "react-autocomplete";

export default (props) => (
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
    value={props.value}
    wrapperStyle={{
      position: "relative",
      display: "inline-block",
    }}
    inputProps={props.inputProps}
    shouldItemRender={(item, v) =>
      item[props.itemKey].toLowerCase().indexOf(v.toLowerCase()) !== -1
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
    onChange={(_, v) => props.setValue(v)}
    onSelect={(_, item) => {
      props.setValue(item[props.itemKey]);
      if ("setMeasure" in props) {
        props.setMeasure(item[props.sortKey]);
      }
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
