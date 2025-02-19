import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Register from './pages/Register';
import SignIn from './pages/SignIn';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout> </Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/sign-in" element={<Layout><SignIn /></Layout>} />
      </Routes>
    </Router>
  );
};


export default App;