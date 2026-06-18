export function ErrorState({ message }: { message: string }) {
  return (
    <div className="center-screen">
      <h1>Algo saiu do ar</h1>
      <p>{message}</p>
      <button onClick={() => window.location.reload()} tabIndex={0}>Tentar novamente</button>
    </div>
  );
}
