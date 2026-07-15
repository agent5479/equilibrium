"use client";

import Link from "next/link";
import { routePath } from "@/lib/paths";

export default function ContactForms() {
  return (
    <div className="contact-grid">
      <div>
        <h3>Online Enquiries</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input type="text" id="name" name="name" required disabled />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-Mail *</label>
            <input type="email" id="email" name="email" required disabled />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea id="message" name="message" required disabled />
          </div>
          <button type="submit" className="btn-primary" disabled>
            Submit
          </button>
          <p className="form-notice">
            Online enquiries form coming soon. Please call{" "}
            <a href="tel:+6421991989">021 991 989</a>, email Patricia, or{" "}
            <Link href={routePath("/bookings/")}>book a session online</Link>.
          </p>
        </form>
      </div>

      <div>
        <h3>Sign up for my newsletter</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="newsletter-email">Email Address *</label>
            <input type="email" id="newsletter-email" name="email" required disabled />
          </div>
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input type="text" id="first-name" name="firstName" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" id="last-name" name="lastName" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" disabled />
          </div>
          <button type="submit" className="btn-primary" disabled>
            Subscribe
          </button>
          <p className="form-notice">Newsletter signup coming soon.</p>
        </form>
      </div>
    </div>
  );
}
