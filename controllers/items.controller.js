import Item from "../models/items.model.js";

// Create a new item
export const createItem = async (req, res) => {
  const { item_code, item_name, price } = req.body;
  try {
    const existingItem = await Item.findOne({ where: { item_code } });
    if (existingItem) {
      return res.status(400).json({
        message: "Item is Already Exists",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than zero",
      });
    }

    const newItem = await Item.create({
      item_code,
      item_name,
      price,
    });
    res
      .status(201)
      .json({ message: "Item created successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get request
export const getAllItems = async (req, res) => {
    try{
        const items = await Item.findAll();
        res.status(200).json(items);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

// get single item by id
export const getItemById = async (req, res) => {
    const { id } = req.params;
    try{
        const item = await Item.findByPk(id);
        if(!item){
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}


// update item by id
export const updateItemById = async (req, res) => {
    const { id } = req.params;
    const { item_code, item_name, price } = req.body;
    try{
        const item = await Item.findByPk(id);
        if(!item){
            return res.status(404).json({ message: "Item not found" });
        }
        item.item_code = item_code || item.item_code;
        item.item_name = item_name || item.item_name;
        item.price = price || item.price;
        await item.save();
        res.status(200).json({ message: "Item updated successfully", item });
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}


// delete item by id
export const deleteItemById = async (req, res) => {
    const { id } = req.params;
    try{
        const item = await Item.findByPk(id);
        if(!item){
            return res.status(404).json({ message: "Item not found" });
        }
        await item.destroy();
        res.status(200).json({ message: "Item deleted successfully" });
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

