import City from "../models/City.js";

export const Cities = async (req , res) =>{
      const cities = await City.findAll();
      res.json(cities);
}