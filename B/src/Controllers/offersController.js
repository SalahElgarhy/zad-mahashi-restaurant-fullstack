import Offers from '../DB/models/Offers.js';
import asyncHandler from 'express-async-handler';


export const getAllOffers = asyncHandler(async (req, res, next) => {
    const offers = await Offers.find().populate('productId');
    res.json(offers);
});


export const createOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offers.create(req.body);
    res.status(201).json(offer);
});