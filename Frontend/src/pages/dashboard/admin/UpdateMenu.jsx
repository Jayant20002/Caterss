import React from "react";
import { useForm } from "react-hook-form";
import { useLoaderData, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";

const UpdateMenu = () => {
  const item = useLoaderData();
  const { register, handleSubmit, reset } = useForm();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  // image hosting keys
  const image_hosting_key = "a87740c0fd1c33e47b22686df4318157";
  const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

  // on submit form
  const onSubmit = async (data) => {
    try {
      let imageUrl = item.image; // Keep existing image by default

      // Only upload new image if one is selected
      if (data.image && data.image[0]) {
        // Create a FormData object
        const formData = new FormData();
        formData.append('image', data.image[0]);
        
        // Use a direct axios instance without withCredentials for ImgBB
        // Don't set Content-Type header - let the browser set it with the boundary
        const hostingImg = await axios.post(image_hosting_api, formData);

        if (hostingImg.data.success) {
          imageUrl = hostingImg.data.data.display_url;
        }
      }

      const menuItem = {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        image: imageUrl,
      };

      const menuRes = await axiosSecure.patch(`/menu/${item._id}`, menuItem);
      
      if (menuRes.status === 200) {
        reset();
        Swal.fire({
          position: "center",
          icon: "success",
          title: `Item is updated successfully!`,
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/dashboard/manage-items");
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to update menu item. Please try again.",
        showConfirmButton: true
      });
    }
  };

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[870px] mx-auto px-4">
      <h2 className="text-2xl font-semibold my-4">
        Update <span className="text-green">Menu Item</span>
      </h2>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-control w-full my-6">
            <label className="label">
              <span className="label-text">Recipe Name*</span>
            </label>
            <input
              type="text"
              placeholder="Recipe Name"
              defaultValue={item.name}
              {...register("name", { required: true })}
              required
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex gap-6">
            {/* category */}
            <div className="form-control w-full my-6">
              <label className="label">
                <span className="label-text">Category*</span>
              </label>
              <select
                defaultValue={item.category}
                {...register("category", { required: true })}
                className="select select-bordered w-full"
              >
                <option disabled value="default">
                  Select a category
                </option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="CorporateGenie">Corporate</option>
                <option value="FamilyFiesta">Family - Fiesta</option>
                {/* <option value="soup">Soup</option>
                <option value="dessert">Dessert</option>
                <option value="drinks">Drinks</option> */}
                <option value="popular">popular</option>
              </select>
            </div>

            {/* price */}
            <div className="form-control w-full my-6">
              <label className="label">
                <span className="label-text">Price*</span>
              </label>
              <input
                type="number"
                placeholder="Price"
                defaultValue={item.price}
                {...register("price", { required: true })}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          {/* recipe details */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recipe Details</span>
            </label>
            {/* <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
              placeholder="Bio"
            ></textarea> */}
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
              placeholder="recipe details"
              defaultValue={item.description}
            ></textarea>
          </div>

          <div className="form-control w-full my-6">
            <label className="label">
              <span className="label-text">Current Image</span>
            </label>
            <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-lg" />
          </div>

          <div className="form-control w-full my-6">
            <label className="label">
              <span className="label-text">Update Image (Optional)</span>
            </label>
            <input
              {...register("image")}
              type="file"
              className="file-input w-full max-w-xs"
            />
          </div>

          <button className="btn bg-green text-white px-6">
            Update Item <FaUtensils></FaUtensils>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateMenu;
