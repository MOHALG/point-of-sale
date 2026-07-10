import React, { useState } from "react";
import PosKeyBoard from "./PosKeyBoard";

const PosDisplay = () => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyPress = (key) => {
        if (key === "clear") {
            setInputValue("");
        }
        else {
            setInputValue((prevValue) => prevValue + key);
        }
    };

    return (
        <div className="pos-display">
            <input className="pos-display__input" type="text" value={inputValue} readOnly />
            <PosKeyBoard onKeyPress={handleKeyPress} />
        </div>
    );
};

export default PosDisplay;
