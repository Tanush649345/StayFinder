const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken })
const mongoose = require("mongoose");

module.exports.index = async(req,res)=>{
    let allListings = await Listing.find();
    console.log("Database:", mongoose.connection.name);
    console.log("Listings found:", allListings.length);
    res.render("listings/index.ejs",{allListings});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = req.body;
    if(!(listing.owner && currUser._id.equals( listing._id ))){
        req.flash("error","You Dont Have Permission to Edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    let updatedListing = await Listing.findByIdAndUpdate(id,{...listing});
    if(req.file){
        let url = req.file.image.url;
        let filename = req.file.image.filename;
        updatedList.image = {url,filename};
    }
    console.log(updatedListing);
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    if(!(listing.owner && currUser._id.equals( listing._id ))){
        req.flash("error","You Dont Have Permission to Delete this listing");
        return res.redirect(`/listings/${id}`);
    }
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully");
    console.log(deletedListing);
    res.redirect("/listings");
}

module.exports.renderNewForm = async(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.createListing = async(req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send();
    let url = req.body.file.path;
    let filename = req.body.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created Sucessfully");
    res.redirect("/listings");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:"author"})
    .populate("owner");
    if(!listing){
        req.flash("error","Request for your Listing is doesnot Exist");
        return res.redirect("/listings");
    }
    if(listing.geometry.coordinates.length ===0){
        let response = await geocodingClient.forwardGeocode({
            query: listing.location,
            limit: 1
        })
        .send();
        listing.geometry = response.body.features[0].geometry;
        await listing.save();
        console.log(listing.geometry.coordinates);
    }
    console.log(listing.geometry.coordinates);
    res.render("listings/show.ejs",{listing})
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Request for your Listing is doesnot Exist");
        return res.redirect("/listings");
    }
    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace("/uploads","/uploads/w_250");
    req.flash("success","Listing Edited Successfully");
    res.render("listings/edit.ejs",{listing,originalUrl});
}