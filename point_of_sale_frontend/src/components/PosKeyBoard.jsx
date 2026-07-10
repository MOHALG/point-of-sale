const PosKeyBoard = ({ onKeyPress }) => {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['0', '.', 'C'],
    ];

    const handleKeyPress = (key) => {
        if (key === 'C') {
            onKeyPress('clear');
        } else {
            onKeyPress(key);
        }

    };

    return (
        <div className="pos-keyboard">
            {keys.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map((key) => (
                        <button 
                            key={key} 
                            onClick={() => handleKeyPress(key)}
                            className="keyboard-key"
                        >
                            {key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default PosKeyBoard;