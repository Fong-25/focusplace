import Login from './pages/Login.jsx'
import Signup from './pages/SignUp.jsx'
import Lobby from './pages/Lobby.jsx'
import Room from './pages/Room.jsx'
import ProtectedRoute from './components/protectedRoute.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/socketContext'

function App() {

  return (
    <SocketProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
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
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path='/room/:roomId'
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
      </Router>
    </SocketProvider>
  )
}

export default App
