import React from 'react'
import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import '../Contact/Contact.css'
import { FaLocationArrow, FaPhone, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Contact() {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await emailjs.sendForm(
        'service_swb0hfr', // Your EmailJS service ID
        'template_2k1qkif', // Your EmailJS template ID
        form.current,
        'hpp62qWYa1TZX4DME' // Your EmailJS public key
      );

      if (result.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your message has been sent successfully.',
          confirmButtonColor: '#3085d6'
        });
        form.current.reset();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send message. Please try again later.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header1 mb-0">
        <div className="container">
          <div className="row mx-auto text-center justify-center">
            <div className="col-12">
              <h2 className="font-extrabold text-6xl text-green pt-10">Contact Us</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="contact py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="contact-info">
              <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaLocationArrow className="text-green text-xl" />
                  <p>Caters House</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-green text-xl" />
                  <p>+1 9999305000</p>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-green text-xl" />
                  <p>info@cateringservices.com</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <form ref={form} onSubmit={sendEmail}>
                <div className="mb-4">
                  <input
                    type="text"
                    name="user_name"
                    placeholder="Your Name"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="email"
                    name="user_email"
                    placeholder="Your Email"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    className="w-full p-2 border rounded h-32"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
