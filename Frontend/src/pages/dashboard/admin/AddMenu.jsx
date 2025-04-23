import { useForm } from "react-hook-form";
import { FaUtensils } from "react-icons/fa";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import axios from "axios";

const AddMenu = () => {
  const { register, handleSubmit, reset } = useForm();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  // image hosting keys
  const image_hosting_key = "a87740c0fd1c33e47b22686df4318157";
  const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

  // on submit form
  const onSubmit = async (data) => {
    try {
      // Create a FormData object for image upload
      const formData = new FormData();
      formData.append('image', data.image[0]);
      
      // Use a direct axios instance without withCredentials for ImgBB
      // Don't set Content-Type header - let the browser set it with the boundary
      const hostingImg = await axios.post(image_hosting_api, formData);

      if (hostingImg.data.success) {
        // now send the menu item data to the server with the image url
        const menuItem = {
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          description: data.description,
          image: hostingImg.data.data.display_url
        }
        
        const menuRes = await axiosSecure.post('/menu', menuItem);
        if(menuRes.status === 200){
          // show success popup
          reset();
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${data.name} is added to the menu.`,
            showConfirmButton: false,
            timer: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to add menu item. Please try again.",
        showConfirmButton: true
      });
    }
  };

  return (
    <div className="w-full md:w-[870px] mx-auto px-4">
      <h2 className="text-2xl font-semibold my-4">
        Upload A New <span className="text-green">Box - Genie</span>
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
                defaultValue="default"
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
            <textarea
              {...register("description")}
              className="textarea textarea-bordered h-24"
              placeholder="Bio"
            ></textarea>
          </div>

          <div className="form-control w-full my-6">
            <input
              {...register("image", { required: true })}
              type="file"
              className="file-input w-full max-w-xs"
            />
          </div>

          <button className="btn bg-green text-white px-6">
            Add Item <FaUtensils></FaUtensils>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMenu;
