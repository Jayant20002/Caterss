import React from 'react'
import '../../src/index.css'
import whatsapp from '../pages/home/img/whatsapp.png'

export default function WhatsApp() {
  const phoneNumber = '+919999305001';
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <div>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        id="whatsapp-icon" 
        className="bounce"
      >
        <img src={whatsapp} alt="WhatsApp" />
      </a>
    </div>
  )
}
