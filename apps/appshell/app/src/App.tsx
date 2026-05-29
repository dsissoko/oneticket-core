import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/help" element={<HelpScreen />} />
      </Route>
    </Routes>
  );
}
