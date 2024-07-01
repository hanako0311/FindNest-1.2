import React, { useState } from "react";
import { TextInput, Button, Alert } from "flowbite-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { HiCheck } from "react-icons/hi";

export default function ClaimForm() {
  const { itemId } = useParams(); // Retrieve itemId from URL
  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
  });
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedDate = formData.date.toISOString(); // Ensure the date is in ISO string format

    const submissionData = {
      name: formData.name,
      date: formattedDate,
    };

    try {
      console.log("Submitting form...", submissionData, "for item ID:", itemId);
      const response = await fetch(`/api/items/claim/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date.toISOString(),
        }),
      });

      if (response.ok) {
        setShowAlert(true); // Show success alert
        setTimeout(() => {
          setShowAlert(false); // Hide alert after a delay
          navigate(`/item/${itemId}`); // Redirect back to the item details page
        }, 3000); // Delay for alert visibility
      } else {
        const errorData = await response.json(); // Parsing response to get error details
        throw new Error(errorData.message || "Failed to submit claim");
      }
    } catch (error) {
      console.error("Submission failed", error);
      alert("Submission Failed!" + error.message);
    }
  };

  return (
    <div className="p-3 max-w-xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Claim Form</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          placeholder="Name"
          required
          name="name"
          className="w-full"
          onChange={handleChange}
        />
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          required
          maxDate={new Date()}
          className="w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <Button type="submit" gradientDuoTone="cyanToBlue">
          Confirm
        </Button>
        {showAlert && (
          <Alert
            type="success"
            onClose={() => setShowAlert(false)}
            className="mt-4"
          >
            <div className="flex items-center">
              <HiCheck className="h-5 w-5 mr-2" />
              Item Claimed Successfully!
            </div>
          </Alert>
        )}
      </form>
    </div>
  );
}
