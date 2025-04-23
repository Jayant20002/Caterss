import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrashAlt, FaCheckCircle, FaCreditCard } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const BuffetPage = () => {
  const [buffetRequests, setBuffetRequests] = useState([]);
  const [buffetOrders, setBuffetOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, requests, paid
  const axiosSecure = useAxiosSecure();

  // Fetch buffet requests (unpaid)
  const fetchBuffetRequests = async () => {
    try {
      const response = await axiosSecure.get("/buffet");
      console.log("Buffet requests fetched:", response.data);
      setBuffetRequests(response.data.reverse());
    } catch (error) {
      console.error("Error fetching buffet requests:", error);
    }
  };

  // Fetch buffet orders (paid through checkout)
  const { isLoading, refetch, data: paidBuffetOrders = [] } = useQuery({
    queryKey: ["buffet-orders"],
    queryFn: async () => {
      try {
        console.log("Fetching paid buffet orders...");
        const res = await axiosSecure.get("/payments/buffet");
        console.log("Paid buffet orders fetched:", res.data);
        return res.data;
      } catch (error) {
        console.error("Error fetching paid buffet orders:", error);
        // Show error toast only on initial load, not on background refreshes
        if (!paidBuffetOrders.length) {
          Swal.fire({
            icon: 'error',
            title: 'Error fetching orders',
            text: 'There was a problem loading paid orders. Please try refreshing the page.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
        // Return current data to prevent UI from breaking
        return paidBuffetOrders;
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 2000, // 2 seconds between retries
  });

  // Combined data based on active tab
  const getCombinedData = () => {
    if (activeTab === "requests") {
      return buffetRequests;
    } else if (activeTab === "paid") {
      return paidBuffetOrders;
    } else {
      // Combine both and sort by date
      const combined = [
        ...buffetRequests.map(req => ({ ...req, source: 'request' })),
        ...paidBuffetOrders.map(order => ({ 
          ...order, 
          source: 'paid',
          // Map payment fields to buffet fields for consistent display
          name: order.customerInfo?.name || 'Unknown',
          email: order.email,
          phoneNumber: order.customerInfo?.phone || order.customerInfo?.postal_code || 'N/A',
          eventType: order.eventType || 'N/A',
          numberOfGuests: order.numberOfGuests || 0,
          date: order.eventDate || new Date(order.createdAt).toISOString().split('T')[0],
          time: order.eventTime || 'N/A',
          packageName: order.packageName || order.itemsName[0] || 'N/A',
          selected: order.selected || [],
          specialRequests: order.customerInfo?.specialRequests || 'N/A'
        }))
      ];
      return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  useEffect(() => {
    // Fetch buffet data when component mounts
    console.log("Initializing BuffetPage, fetching data...");
    
    // Initial load of data
    fetchBuffetRequests()
      .then(() => console.log("Initial buffet requests loaded"))
      .catch(err => console.error("Error loading buffet requests:", err));
    
    refetch()
      .then(() => console.log("Initial paid buffet orders loaded"))
      .catch(err => console.error("Error loading paid buffet orders:", err));
    
    // Set up interval for refreshing data
    const intervalId = setInterval(() => {
      fetchBuffetRequests()
        .catch(err => console.error("Error refreshing buffet requests:", err));
      
      refetch()
        .catch(err => console.error("Error refreshing buffet orders:", err));
    }, 30000); // Refresh every 30 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [refetch]); // Add refetch to dependency array

  // Display data with better error handling
  const displayData = useMemo(() => {
    console.log("Generating display data, active tab:", activeTab);
    console.log("Buffet requests:", buffetRequests.length);
    console.log("Paid buffet orders:", paidBuffetOrders.length);
    
    return getCombinedData();
  }, [activeTab, buffetRequests, paidBuffetOrders]);
  
  // Show loading state only on initial load
  if (isLoading && !displayData.length) {
    return (
      <div className="w-90 md:w-[870px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-green my-4">Catering Responses</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green"></div>
        </div>
      </div>
    );
  }

  // Function to handle deleting buffet items
  const handleDeleteItem = async (id, source) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          let response;
          if (source === 'request') {
            // Delete unpaid request
            response = await axiosSecure.delete(`/buffet/${id}`);
          } else {
            // Delete paid order (you might want to handle this differently)
            Swal.fire({
              icon: "error",
              title: "Cannot Delete Paid Orders",
              text: "Paid orders cannot be deleted. Please manage them in the orders section.",
            });
            return;
          }

          if (response && response.status === 200) {
            // Refresh data
            fetchBuffetRequests();
            refetch();
            
            // Show success message
            Swal.fire({
              position: "center",
              icon: "success",
              title: `Item deleted successfully`,
              showConfirmButton: false,
              timer: 1500
            });
          }
        }
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK"
      });
    }
  };

  // Update order status (for paid orders)
  const updateOrderStatus = async (orderId, status) => {
    try {
      Swal.fire({
        title: "Update Order Status",
        text: `Are you sure you want to change the status to "${status}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await axiosSecure.patch(`/payments/${orderId}`, { status });
          
          // Refetch data to update the UI
          refetch();
          
          Swal.fire({
            position: "center",
            icon: "success",
            title: `Order status changed to ${status}`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to update order status",
        text: error.response?.data?.message || "An error occurred",
      });
    }
  };

  // Get button text based on status
  const getButtonText = (status) => {
    switch (status) {
      case "order pending":
        return "Confirm";
      case "confirmed":
        return "Prepare";
      case "preparing":
        return "Dispatch";
      case "dispatched":
        return "Complete";
      case "completed":
        return "Completed";
      default:
        return "Confirm";
    }
  };

  // Get button color based on status
  const getButtonColor = (status) => {
    switch (status) {
      case "order pending":
        return "red";
      case "confirmed":
        return "#FFBF00";
      case "preparing":
        return "#FF6347";
      case "dispatched":
        return "blue";
      case "completed":
        return "green";
      default:
        return "red";
    }
  };

  return (
    <div className="w-90 md:w-[870px] mx-auto px-4">
      <h2 className="text-2xl font-bold text-green my-4">Catering Responses</h2>

      {/* Tabs for filtering */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === "all" ? "bg-green text-white" : "bg-gray-200"} rounded-t-lg mr-2`}
          onClick={() => setActiveTab("all")}
        >
          All Catering Orders
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "requests" ? "bg-green text-white" : "bg-gray-200"} rounded-t-lg mr-2`}
          onClick={() => setActiveTab("requests")}
        >
          Unpaid Requests
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "paid" ? "bg-green text-white" : "bg-gray-200"} rounded-t-lg`}
          onClick={() => setActiveTab("paid")}
        >
          Paid Orders
        </button>
      </div>

      {/* No data state */}
      {!isLoading && displayData.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No catering orders found.</p>
        </div>
      )}

      {/* Buffet data table */}
      {!isLoading && displayData.length > 0 && (
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="table w-full items-center ">
            {/* Table head */}
            <thead> 
              <tr className="text-white bg-green">
                <th>#</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Event Type</th>
                <th>Guests</th>
                <th>Date</th>
                <th>Package</th>
                <th>Selected Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr key={index} className={item.source === 'paid' ? 'bg-green-50' : ''}>
                  <td>{index + 1}</td>
                  <td>
                    {item.source === 'paid' ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> 
                        {item.status || "Paid"}
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaCreditCard className="mr-1" /> Unpaid
                      </span>
                    )}
                  </td>
                  <td>
                    {item.paymentMethod ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.paymentMethod === 'online' ? 'bg-blue-100 text-blue-800' : 
                        item.paymentMethod === 'cod' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.paymentMethod.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phoneNumber}</td>
                  <td>{item.eventType}</td>
                  <td>{item.numberOfGuests}</td>
                  <td>{typeof item.date === 'string' ? item.date : new Date(item.date).toLocaleDateString()}</td>
                  <td>{Array.isArray(item.packageName) ? item.packageName.join(', ') : item.packageName}</td>
                  <td style={{ overflowY: 'hidden', whiteSpace: 'nowrap' }}>
                    <div style={{ overflowX: 'hidden', height:'150px', width:'300px', fontSize:'15px' }}>
                      {Array.isArray(item.selected) && item.selected.map((selectedItem, i) => (
                        <span key={i}>
                          {i + 1}. {selectedItem}
                          <br />
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-2">
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteItem(item.source === 'request' ? item.name : item._id, item.source)}
                        className="btn btn-ghost btn-xs"
                        disabled={item.source === 'paid'}
                        title={item.source === 'paid' ? "Cannot delete paid orders" : "Delete"}
                      >
                        <FaTrashAlt className={item.source === 'paid' ? "text-gray-400" : "text-red"} />
                      </button>
                      
                      {/* Status update button (only for paid orders) */}
                      {item.source === 'paid' && (
                        <button
                          className={`btn rounded-full btn-xs text-center text-white`}
                          style={{ backgroundColor: getButtonColor(item.status || "order pending") }}
                          onClick={() => {
                            switch (item.status || "order pending") {
                              case "order pending":
                                updateOrderStatus(item._id, "confirmed");
                                break;
                              case "confirmed":
                                updateOrderStatus(item._id, "preparing");
                                break;
                              case "preparing":
                                updateOrderStatus(item._id, "dispatched");
                                break;
                              case "dispatched":
                                updateOrderStatus(item._id, "completed");
                                break;
                              default:
                                break;
                            }
                          }}
                          disabled={item.status === "completed" || item.status === "cancelled"}
                        >
                          {getButtonText(item.status || "order pending")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BuffetPage;
