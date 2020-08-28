import React, { useState } from "react";
import Autocomplete from "react-autocomplete";

export default ({ items }) => {
  const [selection, setSelection] = useState("");
  return (
    <>
      <Autocomplete
        value={selection}
        inputProps={{ size: "50" }}
        wrapperStyle={{ position: "relative", display: "inline-block" }}
        items={items}
        getItemValue={(item) => item.user}
        //shouldItemRender={matchStateToTerm}
        //sortItems={sortStates}
        onChange={(event, value) => setSelection(value)}
        onSelect={(value) => setSelection(value)}
        renderMenu={(children) => <div className="menu">{children}</div>}
        renderItem={(item, isHighlighted) => (
          <div
            style={{ background: isHighlighted ? "lightgray" : "white" }}
            className={`item ${isHighlighted ? "item-highlighted" : ""}`}
            key={item.abbr}
          >
            {item.user}
          </div>
        )}
      />
    </>
  );
};
