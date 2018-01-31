import React from 'react';

export default function({ onSignIn }) {
  return (
    <div>
      <button onClick={onSignIn}>Sign in</button>
    </div>
  );
}
