import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Shipping from "./pages/admin/Shipping";
import Inventory from "./pages/admin/Inventory"; 
import AdminLogin from "./pages/admin/AdminLogin";
import UploadCSV from "./pages/admin/UploadCSV";
import ProductUpload from "./pages/admin/product_upload";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route for login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Wrap admin pages with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="upload-csv" element={<UploadCSV />} />
          <Route path="product_upload" element={<ProductUpload />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
