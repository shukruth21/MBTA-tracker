// src/App.tsx
import useGeolocation from "./hooks/useGeolocation";
import NearestStationCard from "./components/NearestStationCard";
import InstallPrompt from './components/InstallPrompt';
import "./index.css";

function App() {
  const { state, request } = useGeolocation();

  return (
    <div className="app">
      <InstallPrompt />
      <header>
        <h1>MBTA Quick Widget</h1>
      </header>

      <main>
        <section className="card">
          <h2>Nearest Station (Fast Access)</h2>

          {state.status === "requesting" && <p>Requesting location…</p>}

          {state.status === "granted" && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>
                  <strong>Latitude:</strong> {state.coords.latitude.toFixed(6)}
                </p>
                <p style={{ fontSize: "13px", color: "#666", margin: "4px 0" }}>
                  <strong>Longitude:</strong> {state.coords.longitude.toFixed(6)}
                </p>
                <button 
                  onClick={request}
                  style={{ marginTop: "8px" }}
                >
                  Refresh location
                </button>
              </div>
              <NearestStationCard
                lat={state.coords.latitude}
                lon={state.coords.longitude}
              />
            </>
          )}

          {state.status === "denied" && (
            <div>
              <p>Location permission denied. Please enable location access.</p>
              <p className="muted">{state.message ?? ""}</p>
              <button onClick={request}>Try again</button>
            </div>
          )}

          {state.status === "error" && (
            <div>
              <p>Error getting location: {state.message}</p>
              <button onClick={request}>Try again</button>
            </div>
          )}

          {state.status === "idle" && (
            <div>
              <p>Allow location access to see your nearest MBTA station.</p>
              <button onClick={request}>Allow location</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <small>Real-time MBTA predictions • Updates every 30 seconds</small>
      </footer>
    </div>
  );
}

export default App;