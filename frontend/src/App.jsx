import Login from './pages/Login.jsx'
import Signup from './pages/SignUp.jsx'
import Lobby from './pages/Lobby.jsx'
import ProtectedRoute from './components/protectedRoute.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path='/lobby'
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  )
}

export default App
