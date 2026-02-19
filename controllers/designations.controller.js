import Designation from "../models/designations.model.js";


export const designations = async (req, res) => {
    const designations = await Designation.findAll();
    res.json(designations);
}
