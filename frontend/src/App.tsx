import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import AddHotel from "./pages/AddHotel";
import { UseAppContext } from "./contexts/AppContext";
import MyHotels from "./pages/MyHotels";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import FavoritesPage from "./pages/Favorites";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import HotelManagement from "./pages/HotelManagement";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoutes";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import BookingStatus from "./pages/BookingStatus";
import Home from "./pages/Home";
import AutoRedirect from "./pages/AutoRedirect";

const App = () => {
  const { isLoggedIn, loadingUser } = UseAppContext();

  if (loadingUser) {
    return null;
  }

  return (
    <FavoritesProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Layout showSearch={false}>
                <PrivacyPolicy />
              </Layout>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <Layout showSearch={false}>
                <TermsOfService />
              </Layout>
            }
          />
          <Route
            path="/search"
            element={
              <Layout>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/detail/:hotelId"
            element={
              <Layout>
                <Detail />
              </Layout>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/favorites"
            element={
              <Layout>
                <FavoritesPage />
              </Layout>
            }
          />
          {isLoggedIn && (
            <>
              <Route path="/redirect" element={<AutoRedirect />} />
              <Route
                path="/hotel/:hotelId/booking"
                element={
                  <Layout>
                    <Booking />
                  </Layout>
                }
              />
              <Route
                path="/add-hotel"
                element={
                  <Layout>
                    <AddHotel />
                  </Layout>
                }
              />
              <Route
                path="/edit-hotel/:hotelId"
                element={
                  <Layout>
                    <EditHotel />
                  </Layout>
                }
              />
              <Route
                path="/my-hotels"
                element={
                  <Layout>
                    <MyHotels />
                  </Layout>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <Layout>
                    <MyBookings />
                  </Layout>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <Layout>
                    <EditProfile />
                  </Layout>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="hotels" element={<HotelManagement />} />
                <Route path="bookings" element={<BookingStatus />} />
              </Route>
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
};

export default App;
