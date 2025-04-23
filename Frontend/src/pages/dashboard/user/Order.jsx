import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt, FaReceipt } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import './order.css'

const Order = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentOrders, setCurrentOrders] = useState(true); // Initially, show current orders
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { refetch, data: orders = [] } = useQuery({
    queryKey: ["orders", user?.email],
    enabled: !loading,
    refetchInterval: 5000, // Refetch every 5 seconds
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments?email=${user?.email}`);
      return res.data;
    },
  });

  // Function to get status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "order pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-500";
      case "preparing":
        return "bg-orange-500";
      case "dispatched":
        return "bg-blue-500";
      case "completed":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter orders based on status
  const filteredOrders = currentOrders
    ? orders.filter((order) => ["order pending", "confirmed", "preparing", "dispatched"].includes(order.status))
    : orders.filter((order) => ["completed", "cancelled"].includes(order.status));

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // date format
  const formatDate = (createdAt) => {
    const createdAtDate = new Date(createdAt);
    return createdAtDate.toLocaleDateString(); // You can adjust options as needed
  };

  const handleCancelOrder = async (order) => {
    // Check if the order is in a cancellable state
    const cancellableStatuses = ["order pending", "confirmed"];
    if (!cancellableStatuses.includes(order.status)) {
      Swal.fire({
        icon: "error",
        title: "Cannot Cancel Order",
        text: "This order cannot be cancelled. Only orders with status 'order pending' or 'confirmed' can be cancelled.",
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Cancel Order",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.patch(`/payments/cancel/${order._id}`, {
          email: user.email,
        });

        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Order Cancelled",
            text: "Your order has been successfully cancelled.",
          });
          refetch(); // Refresh the orders list
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to cancel order. Please try again.",
        });
      }
    }
  };

  return (
    <div>
      <div className="page-header mb-0">
        <div className="container">
          <div className="row mx-auto text-center justify-center">
            <div className="col-12">
              <h2 className="font-extrabold text-6xl text-green">TRACK YOUR ORDERS </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
        {/* Buttons for filtering orders */}
        <div className="flex justify-center my-4">
          <div className="relative flex items-center">
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full ${currentOrders ? 'bg-gold' : 'bg-transparent'}`}></div>
            <button
              id="btncurrent"
              className={`mr-4 p-2 rounded-lg border-transparent font-bold ${
                currentOrders ? "bg-green text-white" : "bg-transparent text-green"
              }`}
              onClick={() => setCurrentOrders(true)}
            >
              Current Orders
            </button>
          </div>
          <div className="relative flex items-center">
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full ${!currentOrders ? 'bg-gold' : 'bg-transparent'}`}></div>
            <button
              id="btnprevious"
              className={`border-transparent p-2 rounded-lg font-bold ${
                !currentOrders ? "bg-green text-white" : "bg-white text-green"
              }`}
              onClick={() => setCurrentOrders(false)}
            >
              Completed Orders
            </button>
          </div>
        </div>
        {/* table content */}
        <div>
          {currentItems.length > 0 ? (
            <div>
              <div>
                <div className="overflow-x-auto">
                  <table className="table text-center">
                    {/* head */}
                    <thead className="bg-green text-white rounded-sm">
                      <tr>
                        <th>#</th>
                        <th>Order Date</th>
                        <th>Transition ID</th>
                        <th>Items Ordered</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td className="font-medium">{item.transitionId}</td>
                          <td>
                            {item.itemsName.map((itemName, index) => (
                              <div key={index}>
                                {index + 1} {itemName}
                              </div>
                            ))}
                          </td>
                          <td>₹{item.price}</td>
                          <td style={{ padding: '0px', width: 'fit-content', textAlign: 'center' }}>
                            <div className={`rounded-full py-1 px-3 text-white font-bold ${getStatusColor(item.status)}`}>
                              {item.status}
                            </div>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <Link
                                to="/receipt"
                                state={{ paymentId: item._id }}
                                className="btn btn-sm btn-success"
                              >
                                <FaReceipt />
                              </Link>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => window.location.href = `mailto:support@caters.com?subject=Order Support - ${item.transitionId}`}
                              >
                                Contact Support
                              </button>
                              {["order pending", "confirmed"].includes(item.status) && (
                                <button
                                  className="btn btn-sm btn-error"
                                  onClick={() => handleCancelOrder(item)}
                                >
                                  <FaTrashAlt />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <hr />
            </div>
          ) : (
            <div className="text-center">No orders to display.</div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-center my-10 mb-24">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-sm mr-2 btn-warning"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={indexOfLastItem >= filteredOrders.length}
            className="btn btn-sm bg-green text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
