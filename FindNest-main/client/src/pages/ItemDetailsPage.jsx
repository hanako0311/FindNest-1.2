import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Button, Card } from "flowbite-react";
import { format } from "date-fns";

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    item: "",
    brandName: "",
    category: "",
    imageUrls: [],
    description: "",
    location: "",
    status: "",
    claimantName: "",
    dateFound: "",
  });
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/items/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setActiveImageIndex(0);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-4 shadow-lg bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <button
            className="absolute top-2 left-2 flex items-center text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500"
            onClick={() => navigate("/dashboard?tab=found-items")}
          >
            <FaArrowLeft className="inline-block mr-2" />
            <span className="text-lg">Back to Found Items</span>
          </button>
          <img
            src={item.imageUrls[activeImageIndex]}
            alt="Main Product"
            className="w-full object-contain h-[30rem] rounded-lg"
          />
          <div className="flex overflow-auto gap-2 mt-2 justify-center">
            {item.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Thumbnail ${index}`}
                className={`cursor-pointer w-20 h-20 object-cover rounded-lg ${
                  index === activeImageIndex ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setActiveImageIndex(index)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {item.item}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            {item.brandName}
          </p>
          <p className="text-lg mb-4">
            <span className="font-medium">Location Found:</span>
            <span className="ml-2">{item.location}</span>
          </p>
          <p className="text-lg mb-4">
            <span className="font-medium">Date Found:</span>
            <span className="ml-2">
              {format(new Date(item.dateFound), "PPP")}
            </span>
          </p>
          <p className="text-lg mb-4">
            <span className="font-medium">Category:</span>
            <span className="ml-2">{item.category}</span>
          </p>
          <p className="text-lg mb-4">
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 font-semibold ${
                item.status === "claimed" ? "text-red-500" : "text-green-500"
              }`}
            >
              {item.status}
            </span>
          </p>
          {item.status === "claimed" && (
            <p className="text-lg mb-4">
              <span className="font-medium">Claimant Name:</span>
              <span className="ml-2">{item.claimantName}</span>
            </p>
          )}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            <span className="font-medium">Description:</span>
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {item.description}
          </p>
          {item.status === "claimed" ? (
            <Button disabled className="mt-6">
              Claimed by {item.claimantName}
            </Button>
          ) : (
            <Button
              className="mt-6"
              onClick={() => navigate(`/claim-form/${id}`)}
            >
              Claim
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
