import React from 'react';

//Testing to see if the form actually submits
const SimpleFormTest = () => {
    return (
        <div>
            <form onSubmit={(e) => { e.preventDefault(); console.log('Simple form submitted'); }}>
                <input type="text" required />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default SimpleFormTest;
