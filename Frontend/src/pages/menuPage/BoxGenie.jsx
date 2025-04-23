import React, { useEffect, useState } from "react";
import Cards from "../../components/Cards";
import { FaFilter } from "react-icons/fa";
import { useTheme } from "../../hooks/ThemeContext";
import FamilyFiesta from "./FamilyFiesta";
import CorporateGenie from "./CorporateGenie";
import ReviewSection from "../../components/Review/ReviewSection";
import MenuRecommendations from "../../components/AI/MenuRecommendations";
import SmartSearch from "../../components/AI/SmartSearch";
import TodaysSpecial from "../../components/BoxGenie/TodaysSpecial";
import '../../index.css';
import Swal from 'sweetalert2';
import useMenu from "../../hooks/useMenu";

const BoxGenie = () => {
  const { isDarkMode } = useTheme();
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Number of items to display per page
  
  // Use the useMenu hook to fetch menu data from the backend
  const { menu, loading, error, refetch } = useMenu();

  useEffect(() => {
    // Filter out only Veg and Non-Veg categories for the main display
    const filteredMenu = menu.filter(item => 
      item.category === "Veg" || item.category === "Non-Veg"
    );
    setFilteredItems(filteredMenu);
  }, [menu]);

  const filterItems = (category) => {
    const filtered =
      category === "all"
        ? menu.filter(item => item.category === "Veg" || item.category === "Non-Veg")
        : menu.filter((item) => item.category === category);

    setFilteredItems(filtered);
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const showAll = () => {
    const filteredMenu = menu.filter(item => 
      item.category === "Veg" || item.category === "Non-Veg"
    );
    setFilteredItems(filteredMenu);
    setSelectedCategory("all");
    setCurrentPage(1); 
  };

  const handleSortChange = (option) => {
    setSortOption(option);

    // Logic for sorting based on the selected option
    let sortedItems = [...filteredItems];

    switch (option) {
      case "A-Z":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Z-A":
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "low-to-high":
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case "high-to-low":
        sortedItems.sort((a, b) => b.price - a.price);
        break;
      default:
        // Do nothing for the "default" case
        break;
    }

    setFilteredItems(sortedItems);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      
      <div className="page-header1 mb-0 relative">
        <div className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover"></div>
        <div className="container relative z-10">
          <div className="row mx-auto text-center justify-center">
            <div className="col-12">
              <h2 className="font-extrabold text-6xl text-green z-10">Box - Genie</h2>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-black justify-center text-center text-5xl my-14 font-bold pt-5">INSTANT BOX GENIE</h2>
      
      {/* Today's Special */}
      <TodaysSpecial />

      {/* Smart Search */}
      <div className="bg-gray-50 py-8">
        <SmartSearch />
      </div>

      {/* AI Recommendations */}
      <MenuRecommendations />

      <CorporateGenie />
      <FamilyFiesta />
       
      {/* menu shop  */}
      <div className="section-container text-black" id="menucont">
        <div className="flex flex-col md:flex-row flex-wrap md:justify-between items-center space-y-3 mb-8">
          
           {/* all category buttons */}
          <div className="flex flex-row justify-start md:items-center md:gap-8 gap-4 flex-wrap">
            <button
              onClick={showAll}
              className={selectedCategory === "all" ? "active" : ""}
            >
              All
            </button>
            <button
              onClick={() => filterItems("Veg")}
              className={selectedCategory === "Veg" ? "active" : ""}
            >
              Veg
            </button>
            <button
              onClick={() => filterItems("Non-Veg")}
              className={selectedCategory === "Non-Veg" ? "active" : ""}
            >
              Non-Veg
            </button>
          </div>

          {/* filter options */}
          <div className="flex justify-end mb-4 rounded-sm">
            <div className="bg-black p-2">
              <FaFilter className="text-white h-4 w-4" />
            </div>
            <select
              id="sort"
              onChange={(e) => handleSortChange(e.target.value)}
              value={sortOption}
              className="bg-black text-white px-2 py-1 rounded-sm"
            >
              <option value="default">Default</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
              <button 
                onClick={() => refetch()}
                className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* No menu items */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold">No menu items found</h3>
              <p className="mt-2 text-gray-600">Please try a different category or check back later.</p>
            </div>
          </div>
        )}

        {/* product card */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
            {currentItems.map((item, index) => (
              <Cards key={item._id || index} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section with Sentiment Analysis */}
      <div className="bg-gray-50 py-12">
        <ReviewSection serviceType="BoxGenie" />
      </div>

       {/* Pagination */}
       {!loading && !error && filteredItems.length > itemsPerPage && (
         <div className="flex justify-center my-8 flex-wrap gap-2">
           {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }).map((_, index) => (
             <button
               key={index + 1}
               onClick={() => paginate(index + 1)}
               className={`mx-1 px-3 py-1 rounded-full ${
                 currentPage === index + 1 ? "bg-green text-white" : "bg-gray-200"
               } ${isDarkMode ? "dark border" : ""}`}
             >
               {index + 1}
             </button>
           ))}
         </div>
       )}
    </div>
  );
};

export default BoxGenie;
