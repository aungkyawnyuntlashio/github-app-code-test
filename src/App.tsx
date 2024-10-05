import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserSearch } from './components/UserSearch';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
