import React from 'react';
import './aboutus.css';

import img5 from './img/top-left.jpg';
import img2 from './img/vegees.jpg';
import img3 from './img/staff.jpg';
import img4 from './img/catering.jpg';

export default function Features() {
  return (
    <div>
      {/* First Features Component */}
      <div className="feature text-center my-8"> 
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="max-w-2xl">
              <div className="section-header text-center mb-6">
                <p className="text-xl lg:text-2xl font-bold text-Green">Why Choose Us</p>
                <h2 id='clippath' className="mx-auto inline-block">Our Key Features</h2>
              </div>
              <div className="feature-text">
                <div className="feature-img mb-6">
                  <div className="grid grid-cols-2 gap-4 w-auto h-auto">
                    <div><img src={img5} alt="Image" className="rounded-lg shadow-md" /></div>
                    <div><img src={img2} alt="Image" className="rounded-lg shadow-md" /></div>
                    <div><img src={img3} alt="Image" className="rounded-lg shadow-md" /></div>
                    <div><img src={img4} alt="Image" className="rounded-lg shadow-md" /></div>
                  </div>
                </div>
                <p className="my-4 text-center px-4">
                  We assure you that we will serve fresh and non-contaminated food items, and you will experience a friendly staff.
                </p>
                <div className="text-center">
                  <a href="/boxgenie" className="btn custom-btn bg-green text-white border-none hover:bg-opacity-90 transition">BOX - GENIE</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Features Component */}
      <div className="feature my-12"> 
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="feature-item">
              <i className=""><span className="material-symbols-outlined">diversity_4</span></i>
              <h3 className="font-bold">Best Staff</h3>
              <p>Our chef crafts culinary masterpieces, while our attentive event planners ensure every detail is perfect.</p>
            </div>
            <div className="feature-item">
              <i className="flaticon-vegetable"><span className="material-symbols-outlined">grocery</span></i>
              <h3 className="font-bold">Natural Ingredients</h3>
              <p>Our catering exclusively features dishes prepared with natural ingredients.</p>
            </div>
            <div className="feature-item">
              <i className=""><span className="material-symbols-outlined">editor_choice</span></i>
              <h3 className="font-bold">Best Quality Products</h3>
              <p>Our commitment to excellence ensures that every bite reflects our dedication to providing the best products for your event</p>
            </div>
            <div className="feature-item">
              <i className=""><span className="material-symbols-outlined">set_meal</span></i>
              <h3 className="font-bold">Fresh Vegetables & Meat</h3>
              <p>We pride ourselves on hand-selecting the freshest vegetables and finest cuts of meat, ensuring our dishes are bursting with flavor and quality ingredients</p>
            </div>
            <div className="feature-item">
              <i className=""><span className="material-symbols-outlined">room_service</span></i>
              <h3 className="font-bold">Fastest Door Delivery</h3>
              <p>We ensure swift Door delivery to enhance your catering experience.</p>
            </div>
            <div className="feature-item">
              <i className=""><span className="material-symbols-outlined">support_agent</span></i>
              <h3 className="font-bold">24/7 Customer Service</h3>
              <p>We guarantee round-the-clock customer support services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
