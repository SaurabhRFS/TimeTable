import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // This code runs when the page loads
    fetch('http://localhost:8080/api/hello')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => setMessage("Error: Backend not running!"));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-10 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
        <h1 className="text-4xl font-bold mb-4">Smart Timetable System</h1>
        <p className="text-xl">Status: <span className="font-mono text-green-300">{message}</span></p>
      </div>
    </div>
  );
}

export default App;