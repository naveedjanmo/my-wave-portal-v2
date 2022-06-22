import React from 'react';

const Form = function () {
  return (
    <div className="form-wrap">
      <form>
        <label className="form-label">
          Recipient Address
          <input className="form-text-input" type="text" />
        </label>
        <label>
          Message
          <input className="form-text-input" type="text" />
        </label>
        <br />
        <text>Your contact details</text>
        <label>
          Twitter
          <input className="form-text-input" type="text" />
        </label>
        <label>
          Discord
          <input className="form-text-input" type="text" />
        </label>

        <input type="submit" value="Mint message" />
      </form>
    </div>
  );
};

export default Form;
