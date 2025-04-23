import React, { useContext, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthProvider'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import axios from 'axios';

const UserProfile = () => {
    const { updateUserProfile, user } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: {
          name: user?.name || '',
          phone: user?.phone || 'N/A',
          address: user?.address || 'N/A'
        }
      });
      
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const name = data.name;
            const phone = data.phone;
            const address = data.address;
            let photoURL = user?.photoURL;

            // Handle file upload if a new file is selected
            if (data.photoURL && data.photoURL[0]) {
                const image = data.photoURL[0];
                const formData = new FormData();
                formData.append('image', image);

                try {
                    // Upload to ImgBB
                    const imageHostingKey = 'a87740c0fd1c33e47b22686df4318157';
                    const imageHostingApi = `https://api.imgbb.com/1/upload?key=${imageHostingKey}`;
                    
                    const imageResponse = await axios.post(imageHostingApi, formData);
                    
                    if (imageResponse.data.success) {
                        photoURL = imageResponse.data.data.display_url;
                    } else {
                        throw new Error('Failed to upload image');
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Image Upload Failed',
                        text: 'Failed to upload profile picture. Profile will be updated without the new image.'
                    });
                }
            }

            const result = await updateUserProfile(name, photoURL, phone, address);
            
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Profile updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'Failed to update profile'
                });
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'An unexpected error occurred'
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <div>
            <div className="page-header mb-0">
                <div className="container">
                    <div className="row mx-auto text-center justify-center">
                        <div className="col-12">
                            <h2 className="font-extrabold text-6xl text-green">PROFILE </h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-screen max-w-md mx-auto flex items-center justify-center'>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-control">
                            <label className="label text-white">
                                <span className="label-text">Name</span>
                            </label>
                            <input 
                                type="text" 
                                {...register("name", { required: "Name is required" })} 
                                placeholder="Your name" 
                                className="input input-bordered text-white" 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        
                        <div className="form-control">
                            <label className="label text-white">
                                <span className="label-text">Phone</span>
                            </label>
                            <input 
                                type="text" 
                                {...register("phone")} 
                                placeholder="Your phone number" 
                                className="input input-bordered text-white" 
                            />
                        </div>
                        
                        <div className="form-control">
                            <label className="label text-white">
                                <span className="label-text">Address</span>
                            </label>
                            <textarea 
                                {...register("address")} 
                                placeholder="Your address" 
                                className="textarea textarea-bordered text-white" 
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div className="form-control">
                            <label className="label text-white">
                                <span className="label-text">Upload Photo</span>
                            </label>
                            <input 
                                type="file" 
                                {...register("photoURL")} 
                                className="file-input w-full mt-1 text-white"
                                accept="image/*"
                            />
                        </div>
                        
                        <div className="form-control mt-6">
                            <button 
                                type='submit' 
                                className="btn bg-green text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UserProfile