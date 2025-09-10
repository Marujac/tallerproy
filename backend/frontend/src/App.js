import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.json())
      .then(data => setMensaje(data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{mensaje || "Hello World."}</h1>
    </div>
  );
}

export default App;
