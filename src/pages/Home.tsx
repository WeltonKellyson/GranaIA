import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>🚀 Bem-vindo à Landpage GranAIa!</h1>
      <p>Esta é só uma página besta pra testar o acesso 😁</p>

      <button onClick={() => setCount(count + 1)}>
        Cliquei {count} vez{count === 1 ? '' : 'es'}
      </button>
    </div>
  );
}
