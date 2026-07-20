"use client";

import { useState } from "react";
import Link from "next/link";
import { routePath } from "@/lib/paths";
import { submitContact, submitNewsletter } from "@/lib/contact";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForms() {
  const [enquiryStatus, setEnquiryStatus] = useState<FormStatus>("idle");
  const [enquiryFeedback, setEnquiryFeedback] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquirySubject, setEnquirySubject] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");

  const [newsletterStatus, setNewsletterStatus] = useState<FormStatus>("idle");
  const [newsletterFeedback, setNewsletterFeedback] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleEnquiry(e: React.FormEvent) {
    e.preventDefault();
    setEnquiryStatus("submitting");
    setEnquiryFeedback("");
    const result = await submitContact({
      name: enquiryName,
      email: enquiryEmail,
      subject: enquirySubject,
      message: enquiryMessage,
    });
    if (result.success) {
      setEnquiryStatus("success");
      setEnquiryFeedback(result.message);
      setEnquiryName("");
      setEnquiryEmail("");
      setEnquirySubject("");
      setEnquiryMessage("");
    } else {
      setEnquiryStatus("error");
      setEnquiryFeedback(result.message);
    }
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterStatus("submitting");
    setNewsletterFeedback("");
    const result = await submitNewsletter({
      email: newsletterEmail,
      firstName,
      lastName,
      phone,
    });
    if (result.success) {
      setNewsletterStatus("success");
      setNewsletterFeedback(result.message);
      setNewsletterEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    } else {
      setNewsletterStatus("error");
      setNewsletterFeedback(result.message);
    }
  }

  return (
    <div className="contact-grid">
      <div>
        <h3>Online Enquiries</h3>
        <form onSubmit={handleEnquiry}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={enquiryName}
              onChange={(e) => setEnquiryName(e.target.value)}
              disabled={enquiryStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-Mail *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={enquiryEmail}
              onChange={(e) => setEnquiryEmail(e.target.value)}
              disabled={enquiryStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={enquirySubject}
              onChange={(e) => setEnquirySubject(e.target.value)}
              disabled={enquiryStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              required
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              disabled={enquiryStatus === "submitting"}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={enquiryStatus === "submitting"}
          >
            {enquiryStatus === "submitting" ? "Sending…" : "Submit"}
          </button>
          {enquiryFeedback ? (
            <p
              className={`form-notice ${enquiryStatus === "success" ? "success" : "error"}`}
            >
              {enquiryFeedback}
            </p>
          ) : (
            <p className="form-notice">
              Or call{" "}
              <a href="tel:+6421991989">021 991 989</a>, email Patricia, or{" "}
              <Link href={routePath("/bookings/")}>book a session online</Link>.
            </p>
          )}
        </form>
      </div>

      <div>
        <h3>Sign up for my newsletter</h3>
        <form onSubmit={handleNewsletter}>
          <div className="form-group">
            <label htmlFor="newsletter-email">Email Address *</label>
            <input
              type="email"
              id="newsletter-email"
              name="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={newsletterStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={newsletterStatus === "submitting"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={newsletterStatus === "submitting"}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={newsletterStatus === "submitting"}
          >
            {newsletterStatus === "submitting" ? "Subscribing…" : "Subscribe"}
          </button>
          {newsletterFeedback ? (
            <p
              className={`form-notice ${newsletterStatus === "success" ? "success" : "error"}`}
            >
              {newsletterFeedback}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
