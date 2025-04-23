import React from 'react'
import '../index.css';
export default function Footer() {
  return (
    <div>
      <div className="footer">
            <div className="container">
                <div className="row">
                    <div className="col-lg-7">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="footer-contact">
                                    <h2>Our Address</h2>
                                    <p><i className="fa fa-map-marker" style={{fontSize:'18px'}}></i>Plot No: 45, Sector 12, Dwarka, New Delhi - 110075</p>
                                    <p><i className="fa fa-phone" style={{fontSize:'20px'}}></i>011-4567 8901 / 98765 43210</p>
                                    <p><i className="fa fa-envelope"></i>contact@delhicaters.com</p>
                                    <div className="footer-social">
                                        <a href="#"><i className="fab fa-twitter"></i></a>
                                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a href="#"><i className="fab fa-youtube"></i></a>
                                        <a href="#"><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="footer-link">
                                    <h2>Quick Links</h2>
                                    <a href="/">Home</a>
                                    <a href="/boxgenie">Box-Genie</a>
                                    <a href="/wedding-catering">Wedding-Catering</a>
                                    <a href="/event-catering">Event-Catering</a>
                                    <a href="/corporate-catering">Corporate-Catering</a>
                                    <a href="/contact">Contact</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="footer-newsletter">
                            <h2>Any Feedbacks? To Serve You Better</h2>
                            <div className="form">
                                <p>Please Feel Free To <a href="/contact"><button>Contact Us</button></a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <div className="container">
                    <p>Copyright &copy; <a href="/">CATERS HOUSE</a>, All Right Reserved.</p>
                    <p>Designed By PACT</p>
                </div>
            </div>
        </div>
    </div>
  )
}
