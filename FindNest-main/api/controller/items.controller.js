import Item from "../models/items.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import validator from "validator"; // npm install validator

export const createItem = async (req, res, next) => {
  const { item, dateFound, location, description, imageUrls, category } =
    req.body;

  if (
    !item ||
    !dateFound ||
    !location ||
    !description ||
    !category ||
    !imageUrls ||
    imageUrls.length === 0
  ) {
    return next(
      errorHandler(
        400,
        "Please fill in all required fields, including image URLs"
      )
    );
  }

  if (!imageUrls.every((url) => validator.isURL(url))) {
    return next(errorHandler(400, "Please provide valid URLs for all images"));
  }

  try {
    const user = await User.findById(req.user.id); // Fetch the user's details
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const newItem = new Item({
      item,
      dateFound,
      location,
      description,
      imageUrls,
      category,
      userRef: req.user.id,
      department: user.department, // Include the department
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 99;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Constructing the query object
    let query = {};
    if (req.query.item) query.item = req.query.item;
    if (req.query.category) query.category = req.query.category;
    if (req.query.searchTerm) {
      query.$or = [
        { item: { $regex: req.query.searchTerm, $options: "i" } },
        { description: { $regex: req.query.searchTerm, $options: "i" } },
      ];
    }

    const items = await Item.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: sortDirection });

    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    next(error);
  }
};

export const getItemDetails = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateItem = async (req, res, next) => {
  const { itemId } = req.params;
  const {
    item,
    dateFound,
    location,
    description,
    imageUrls,
    category,
    department,
  } = req.body;

  if (
    !item ||
    !dateFound ||
    !location ||
    !description ||
    !category ||
    !imageUrls ||
    imageUrls.length === 0
  ) {
    return next(
      errorHandler(
        400,
        "Please fill in all required fields, including image URLs"
      )
    );
  }

  if (!imageUrls.every((url) => validator.isURL(url))) {
    return next(errorHandler(400, "Please provide valid URLs for all images"));
  }

  const allowedRoles = ["superAdmin", "admin", "staff"];
  if (!allowedRoles.includes(req.user.role)) {
    return next(errorHandler(403, "You are not allowed to update this item"));
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      {
        item,
        dateFound,
        location,
        description,
        imageUrls,
        category,
        department,
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  const { itemId } = req.params;

  const allowedRoles = ["superAdmin", "admin", "staff"];
  if (!allowedRoles.includes(req.user.role)) {
    return next(errorHandler(403, "You are not allowed to delete this item"));
  }

  try {
    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item has been deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    next(error);
  }
};

export const claimItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, date } = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { status: "claimed", claimantName: name, claimedDate: date },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to claim item", error: error.toString() });
  }
};

export const getTotalItems = async (req, res) => {
  console.log("getTotalItems function called");
  try {
    const totalItems = await Item.countDocuments();
    const itemsClaimed = await Item.countDocuments({ status: "claimed" });
    const itemsPending = await Item.countDocuments({ status: "available" });

    res.json({
      totalItems,
      itemsClaimed,
      itemsPending,
    });
  } catch (error) {
    console.error("Failed to fetch item counts:", error);
    res.status(500).json({
      message: "Failed to fetch item counts",
      error: error.toString(),
    });
  }
};
